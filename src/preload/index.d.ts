import { ElectronAPI } from '@electron-toolkit/preload'
import type { ConfigStorage } from "./util/configStorage"
import { PromiseWithChild } from 'child_process'
import { PlatformPath } from 'path'
import launchGame from "./util/launchGame";
import scanRoms from "./util/scanRoms"

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    configStorage: ConfigStorage
    launchGame: typeof launchGame
    path: PlatformPath
    scanRoms: typeof scanRoms
  }
}
