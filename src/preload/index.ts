import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from "./fs"
import configStorage from './util/configStorage'
import { exec as execCb } from 'child_process';
import path from 'path';
import { ROM_PATH } from './util/const';
import { promisify } from 'util';

const exec = promisify(execCb);

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('fs', fs)
    contextBridge.exposeInMainWorld('configStorage', configStorage)
    contextBridge.exposeInMainWorld('launchGame', (romname, system, emulator) => {
      const romPath = path.join(ROM_PATH, system, romname);
      return exec(`open "${romPath}" -a ${emulator}`)
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
