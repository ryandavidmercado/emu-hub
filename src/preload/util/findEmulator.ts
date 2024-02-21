import { Emulator } from '@common/types'
import os from 'os'
import { readdir, stat, readFile } from 'fs/promises'
import path from 'path'
import { LINUX_APPLICATION_PATHS, SNAP_PATHS } from './const'
import { loadConfig } from './configStorage'
import { existsSync, statSync } from 'fs'
import { exec as execCb } from "child_process";
import { promisify } from "util"
import { raEmulatorEntry } from '@common/features/RetroArch'
import { AppConfig } from '@common/types/AppConfig'
import log from 'electron-log/renderer'

const exec = promisify(execCb);

const platform = os.platform()

const findRaPath = async (): Promise<string> => {
  const { paths: { RetroArch: configRaPath }} = loadConfig('config', {}) as AppConfig
  return configRaPath || findEmulator(raEmulatorEntry as unknown as Emulator)
}

const findEmulator = async (emulator: Emulator): Promise<string> => {
  if ('bin' in emulator.location) return emulator.location.bin
  if ('core' in emulator.location) {
    return `${await findRaPath()} -L ${emulator.location.core}`
  }

  log.info(`Attempting to find emulator: ${emulator.name}`)

  switch (platform) {
    case 'darwin': {
      const location = await findDarwinEmulator(emulator)
      log.info(`Found emulator ${emulator.name} at ${location} !`)
      return location
    }
    case 'linux': {
      const location = await findLinuxEmulator(emulator)
      log.info(`Found emulator ${emulator.name} at ${location} !`)
      return location
    }
  }

  throw {
    type: 'os-not-compat',
    data: platform
  }
}

async function findDarwinEmulator(emulator: Emulator): Promise<string> {
  if (!('darwin' in emulator.location) || !emulator.location.darwin) {
    throw {
      type: 'emu-os-compat',
      data: emulator
    }
  }

  log.info(`Searching for emulator ${emulator.name} in /Applications/${emulator.location.darwin.name}*.app ...`)
  const appDir = await readdir('/Applications')
  const matcher = new RegExp(`^${escapeRegExp(emulator.location.darwin.name)}.*\.app$`)

  const emuDir = appDir.find((app) => app.match(matcher))
  if (!emuDir) {
    log.error(`Couldn't find match for /Applications/${emulator.location.darwin.name}*.app !`)
    throw {
      type: 'emu-not-found',
      data: emulator
    }
  }

  const emuMacOSDir = path.join('/', 'Applications', emuDir, 'Contents', 'MacOS')
  const binName = (await readdir(emuMacOSDir))?.[0]

  if (!binName)
    throw {
      type: 'emu-not-found',
      data: emulator
    }

  return `"${path.join(emuMacOSDir, binName)}"`
}

async function findLinuxEmulator(emulator: Emulator): Promise<string> {
  if (!('linux' in emulator.location) || !emulator.location.linux) {
    throw {
      type: 'emu-os-compat',
      data: emulator
    }
  }

  if (emulator.location.linux.appImage) {
    log.info(`Attempting to find ${emulator.name} by AppImage ...`)
    const matcher = new RegExp(`^${escapeRegExp(emulator.location.linux.appImage)}.*\.AppImage$`)

    for (const applicationPath of LINUX_APPLICATION_PATHS) {
      log.info(`Scanning ${applicationPath}`)

      let dirContents: string[]
      try {
        dirContents = await readdir(applicationPath)
      } catch {
        log.warn(`Failed to read ${applicationPath}!`)
        continue
      }

      for (const entry of dirContents) {
        const entryPath = path.join(applicationPath, entry)
        const entryStat = await stat(entryPath)

        if (!entryStat.isDirectory() && entry.match(matcher)) {
          return `"${path.join(applicationPath, entry)}"`
        }
      }
    }
  }

  log.info('AppImage not found!')

  if (emulator.location.linux.binName) {
    log.info(`Attempting to find ${emulator.name} by bin ...`)
    // see if we're linked in PATH
    try {
      log.info(`Scanning in PATH ...`)
      const { stdout } = await exec(`which ${emulator.location.linux.binName}`)
      if(stdout) return stdout
    } catch {}

    const matcher = new RegExp(`^${escapeRegExp(emulator.location.linux.binName)}$`)

    for (const applicationPath of LINUX_APPLICATION_PATHS) {
      let dirContents: string[]
      try {
        dirContents = await readdir(applicationPath)
      } catch {
        continue
      }

      for (const entry of dirContents) {
        log.info(`Scanning ${applicationPath}`)

        const entryPath = path.join(applicationPath, entry)
        const entryStat = await stat(entryPath)

        if (!entryStat.isDirectory()) {
          if (entry.match(matcher)) return parseDesktopFile(path.join(applicationPath, entry))
        } else {
          // we can scan for binNames one layer deep; don't go deeper to keep this quick
          log.info(`Scanning ${entryPath}`)

          const entryContents = await readdir(entryPath)
          const match = entryContents.find(
            (entryContent) =>
              entryContent.match(matcher) &&
              !statSync(path.join(entryPath, entryContent)).isDirectory()
          )

          if (match) return parseDesktopFile(path.join(entryPath, match))
        }
      }
    }
  }

  if (emulator.location.linux.flatpak) {
    try {
      const { stdout } = await exec(`flatpak info ${emulator.location.linux.flatpak}`)
      if(stdout) return `flatpak run ${emulator.location.linux.flatpak}`
    } catch(e) {
      console.log(e)
    }
  }

  if (emulator.location.linux.snap) {
    for (const snapPath of SNAP_PATHS) {
      const emuPath = path.join(snapPath, emulator.location.linux.snap)

      if (!existsSync(emuPath)) continue
      return `"${emuPath}"`
    }
  }

  throw {
    type: 'emu-not-found',
    data: emulator
  }
}

// super simple .desktop parse; we just use the Exec field
async function parseDesktopFile(filePath: string): Promise<string> {
  if(path.extname(filePath).toLowerCase() !== '.desktop') return `"${filePath}"`;

  log.info(`Parsing .desktop file: ${filePath}`)

  const execMatcher = /^Exec=(.*)$/m

  const file = await readFile(filePath, { encoding: 'utf8' })
  const execString = file.match(execMatcher)?.[1]
  if (!execString) {
    log.error('Failed to parse .desktop file!')
    throw 'desktop-could-not-parse'
  }

  log.info(`Parsed exec string from .desktop file: ${execString}`)
  return execString;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
} // https://stackoverflow.com/a/6969486

export default findEmulator
