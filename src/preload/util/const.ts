import { existsSync, mkdirSync } from 'fs'
import os from 'os'
import path from 'path'
import { getSystemPaths } from './getSystemPaths'

const systemPaths = getSystemPaths()

const CONFIG_PATH = systemPaths.config
const ROMS_PATH = systemPaths.romsDefault
const ASSETS_PATH = path.join(systemPaths.data, 'assets')
const GAME_ASSETS_PATH = path.join(ASSETS_PATH, 'games')

const SNAP_PATHS = [path.join('/', 'snap')]
const LINUX_APPLICATION_PATHS = [
  path.join(os.homedir(), 'Applications'),
  path.join(os.homedir(), '.local', 'share', 'applications'),
  path.join(os.homedir(), '.local', 'bin'),
  path.join(os.homedir(), '.bin')
]


for (const path of [CONFIG_PATH, ASSETS_PATH, GAME_ASSETS_PATH, ROMS_PATH]) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

export {
  CONFIG_PATH,
  ASSETS_PATH,
  GAME_ASSETS_PATH,
  LINUX_APPLICATION_PATHS,
  SNAP_PATHS,
  ROMS_PATH
}
