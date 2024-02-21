import path from 'path'
import { Game, Emulator, System } from '@common/types'
import { spawn } from 'child_process'
import { loadConfig } from './configStorage'
import { readFileSync } from 'fs'
import findEmulator from './findEmulator'
import { AppConfig } from '@common/types/AppConfig'
import { raEmulatorEntry } from '@common/features/RetroArch'

const parseLaunchCommand = (
  command: string,
  emulatorLocation: string,
  romLocation: string
) => {
  const templateMap = {
    /*  NOTE: Emulator path for RetroArch cores pre-includes the core launch command
        ex: "/path/to/RetroArch.AppImage" -L core_to_launch */
    '%EMUPATH%': () => emulatorLocation, // ex: "/home/Applications/CoolEmu.AppImage"
    '%ROMPATH%': () => romLocation, // ex: /path/to/roms/someSystem/someParentDir/myRom.rom
    '%ROMDIR%': () => path.dirname(romLocation), // ex: /path/to/roms/someSystem/someParentDir
    '%ROMDIRNAME%': () => path.basename(path.dirname(romLocation)), // ex: someParentDir
    '%ROMNAME%': () => path.parse(romLocation).base, // ex: myRom.rom
    '%ROMNAMENOEXT%': () => path.parse(romLocation).name, // ex: myRom
    '%ROMEXT%': () => path.parse(romLocation).ext, // .rom
    '%ROMTEXTCONTENT%': () => readFileSync(romLocation, { encoding: 'utf8' }).trim() // ex: rom is text file with contents "Hello" -> this returns "Hello"
  } as const

  const injectTemplateValues = (command: string) => Object.keys(templateMap).reduce((command, templateKey) => {
    if (!command.includes(templateKey)) return command
    return command.replaceAll(templateKey, templateMap[templateKey]())
  }, command)

  return injectTemplateValues(command)
}

const launchGame = async (game: Game, emulator: Emulator, system: System) => {
  const emulatorLocation = await findEmulator(emulator);

  const { paths: { roms: romPath } } = loadConfig(
    'config',
    {} /* we don't need to supply a default; jotai initializes this config on boot */
  ) as AppConfig

  const systemDir = system.romdir ?? path.join(romPath, system.id)
  const romLocation = path.join(systemDir, ...(game.rompath ?? []), game.romname)

  const args = [
    ...('core' in emulator.location ? (raEmulatorEntry.args ?? []) : []),
    ...(emulator.args ?? [])
  ].join(" ")

  const defaultLaunchCommand = `%EMUPATH% ${args} "%ROMPATH%"`
  const launchCommand = emulator.launchCommands?.[path.extname(game.romname)]
      ?? emulator.launchCommand
      ?? defaultLaunchCommand

  const parsedCommand = parseLaunchCommand(launchCommand, emulatorLocation, romLocation)

  console.log(`Launching ${game.name} with command: ${parsedCommand}`)

  const spawnedProcess = spawn(parsedCommand, [], { detached: true, shell: true, windowsHide: true })

  const execInstance = new Promise<void>((resolve, reject) => {
    spawnedProcess.on('close', (status) => {
      if(status !== 1) resolve();

      if ('core' in emulator.location) {
        reject({ type: 'emu-not-found', data: emulator })
      }
    })

    spawnedProcess.on('error', (e) => {
      reject(e)
    })
  })

  const abort = () => {
    if(!spawnedProcess.pid) return;
    process.kill(-spawnedProcess.pid, emulator.killSignal || 'SIGTERM')
  }

  return {
    execInstance,
    abort,
    game
  }
}

export default launchGame
