import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import configStorage from './util/configStorage'
import path from 'path';
import launchGame from './util/launchGame';
import scanRoms from './util/scanRoms';
import loadSystemStore from './util/loadSystemStore';
import downloadGame from './util/downloadGame';
import getRomFileInfo from './util/getRomFileInfo';
import downloadGameMedia from './util/downloadGameMedia';
import loadGameMedia from './util/loadGameMedia';

// Custom APIs for renderer
const api = {}

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
    contextBridge.exposeInMainWorld('loadGameMedia', loadGameMedia)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
