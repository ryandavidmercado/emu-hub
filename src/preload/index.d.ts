import { ElectronAPI } from '@electron-toolkit/preload'
import type { ConfigStorage } from "./util/configStorage"
import { PromiseWithChild } from 'child_process'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    configStorage: ConfigStorage
    launchGame: (romname: string, system: string, emulator: string) => PromiseWithChild<{ stdout: string, stderr: string}>
  }
}
