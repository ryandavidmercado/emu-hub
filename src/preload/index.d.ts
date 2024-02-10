import { ElectronAPI } from '@electron-toolkit/preload'
import type { ConfigStorage } from './util/configStorage'
import { PromiseWithChild } from 'child_process'
import { PlatformPath } from 'path'

import launchGame from './util/launchGame'
import scanRoms from './util/scanRoms'
import downloadGame from './util/downloadGame'
import downloadGameMedia from './util/downloadGameMedia'
import getRomFileInfo from './util/getRomFileInfo'
import loadSystemStore from './util/loadSystemStore'
import loadMedia from './util/loadMedia'
import removeGameFiles from './util/removeGameFiles'
import initRomDir from './util/initRomDir'
import { installEmulator } from './util/installEmulator'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    configStorage: ConfigStorage
    launchGame: typeof launchGame
    path: PlatformPath
    scanRoms: typeof scanRoms
    loadMedia: typeof loadMedia
    loadSystemStore: typeof loadSystemStore
    downloadGame: typeof downloadGame
    downloadGameMedia: typeof downloadGameMedia
    getRomFileInfo: typeof getRomFileInfo
    removeGameFiles: typeof removeGameFiles
    platform: 'darwin' | 'linux' | 'win32'
    homedir: string
    checkDir: (dir: string) => boolean
    initRomDir: typeof initRomDir
    restart: () => void
    quit: () => void
    focusApp: () => void
    hasFlatpak: boolean
    installEmulator: typeof installEmulator
  }
}
