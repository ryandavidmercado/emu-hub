import { AppConfig } from "@common/types/AppConfig";
import { objConfigAtom } from "./util/objConfigAtom";
import deepmerge from "deepmerge";

const defaults: AppConfig = {
  ui: {
    grid: {
      columnCount: 3
   },
    colorScheme: "default",
    controllerHints: true
  },
  paths: {
    roms: window.path.join(window.homedir, 'Documents', 'EmuHub', 'roms')
  },
  credentials: {
    screenscraper: {
      username: '',
      password: ''
    }
  }
}

const merged = deepmerge(defaults, window.configStorage.getItem('config', {}))
window.configStorage.setItem('config', merged)

export const appConfigAtom = objConfigAtom({
  defaults,
  storageKey: 'config'
})
