import { ElectronAPI } from '@electron-toolkit/preload'
import type { ConfigStorage } from "./util/configStorage"
import { PromiseWithChild } from 'child_process'
import { PlatformPath } from 'path'
import launchGame from "./util/launchGame";
import scanRoms from "./util/scanRoms"
import downloadGame from "./util/downloadGame"
import downloadGameMedia from "./util/downloadGameMedia"
import getRomFileInfo from "./util/getRomFileInfo"
import loadSystemStore from "./util/loadSystemStore";
import loadGameMedia from "./util/loadGameMedia";
import removeGameFiles from "./util/removeGameFiles";

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    configStorage: ConfigStorage
    launchGame: typeof launchGame
    path: PlatformPath
    scanRoms: typeof scanRoms
    loadGameMedia: typeof loadGameMedia
    loadSystemStore: typeof loadSystemStore
    downloadGame: typeof downloadGame
    downloadGameMedia: typeof downloadGameMedia
    getRomFileInfo: typeof getRomFileInfo
    removeGameFiles: typeof removeGameFiles
  }
}
