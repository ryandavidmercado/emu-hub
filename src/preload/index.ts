import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import configStorage, { writeDefaultConfig } from './util/configStorage'
import path from 'path'
import launchGame from './util/launchGame'
import scanRoms from './util/scanRoms'
import loadSystemStore from './util/loadSystemStore'
import downloadGame from './util/downloadGame'
import getRomFileInfo from './util/getRomFileInfo'
import downloadGameMedia from './util/downloadGameMedia'
import loadMedia, { loadMediaAsync } from './util/loadMedia'
import removeGameFiles from './util/removeGameFiles'
import os from 'os'
import initRomDir from './util/initRomDir'
import { hasFlatpak } from './util/systemHasFlatpak';

import { setInterval, clearInterval } from 'timers'
window.setInterval = setInterval
window.clearInterval = clearInterval

import sdl, { Sdl } from '@kmamal/sdl'

import { accessSync, constants as fsConstants } from 'fs'
import { installEmulator } from './util/installEmulator'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('configStorage', configStorage)
    contextBridge.exposeInMainWorld('launchGame', launchGame)
    contextBridge.exposeInMainWorld('path', path),
    contextBridge.exposeInMainWorld('scanRoms', scanRoms)
    contextBridge.exposeInMainWorld('loadSystemStore', loadSystemStore)
    contextBridge.exposeInMainWorld('downloadGame', downloadGame)
    contextBridge.exposeInMainWorld('downloadGameMedia', downloadGameMedia)
    contextBridge.exposeInMainWorld('getRomFileInfo', getRomFileInfo)
    contextBridge.exposeInMainWorld('loadMedia', loadMedia)
    contextBridge.exposeInMainWorld('loadMediaAsync', loadMediaAsync)
    contextBridge.exposeInMainWorld('removeGameFiles', removeGameFiles)
    contextBridge.exposeInMainWorld('platform', os.platform())
    contextBridge.exposeInMainWorld('homedir', os.homedir())
    contextBridge.exposeInMainWorld('initRomDir', initRomDir)
    contextBridge.exposeInMainWorld('restart', () => {
      ipcRenderer.invoke('restart')
    })
    contextBridge.exposeInMainWorld('quit', () => {
      ipcRenderer.invoke('quit')
    })
    contextBridge.exposeInMainWorld('focusApp', () => {
      ipcRenderer.invoke('focusApp')
    })
    contextBridge.exposeInMainWorld('checkDir', (dir: string) => {
      try {
        accessSync(dir, fsConstants.R_OK | fsConstants.W_OK)
        return true
      } catch {
        return false
      }
    })
    contextBridge.exposeInMainWorld('hasFlatpak', hasFlatpak)
    contextBridge.exposeInMainWorld('installEmulator', installEmulator)
    contextBridge.exposeInMainWorld('writeDefaultConfig', writeDefaultConfig)
    contextBridge.exposeInMainWorld('gamepad', () => {
      const deviceHandles: Sdl.Controller.ControllerInstance[] = []
      sdl.controller.on('deviceAdd', (d) => { console.log(d) })
      sdl.controller.on('deviceRemove', (d) => { console.log(d)})

      return {
        devices: sdl.controller.devices,
        openDevice: () => {
          deviceHandles.push(sdl.controller.openDevice(sdl.controller.devices[0]))
        },
        rumbleTest: () => { deviceHandles[0].rumble(1, 1, 1e3) }
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
