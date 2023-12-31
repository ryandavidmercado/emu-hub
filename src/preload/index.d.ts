import { ElectronAPI } from '@electron-toolkit/preload'
import type { ConfigStorage } from "./util/configStorage"

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    configStorage: ConfigStorage
  }
}
