import { existsSync, mkdirSync } from 'fs'
import os from 'os'
import path from 'path'

const HOME_PATH = os.homedir()

const EMUHUB_PATH = path.join(HOME_PATH, '.emuhub')
const CONFIG_PATH = path.join(EMUHUB_PATH, 'config')

const ASSETS_PATH = path.join(EMUHUB_PATH, 'assets')
const GAME_ASSETS_PATH = path.join(ASSETS_PATH, 'games')

const SNAP_PATHS = [path.join('/', 'snap')]

const LINUX_APPLICATION_PATHS = [
  path.join(os.homedir(), 'Applications'),
  path.join(os.homedir(), '.local', 'share', 'applications'),
  path.join(os.homedir(), '.local', 'bin'),
  path.join(os.homedir(), '.bin')
]

const ROMS_PATH = path.join(HOME_PATH, "Documents", "EmuHub", "roms");

for (const path of [EMUHUB_PATH, CONFIG_PATH, ASSETS_PATH, GAME_ASSETS_PATH, ROMS_PATH]) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

export {
  EMUHUB_PATH,
  CONFIG_PATH,
  ASSETS_PATH,
  GAME_ASSETS_PATH,
  LINUX_APPLICATION_PATHS,
  SNAP_PATHS
}
