import { atomWithStorage } from "jotai/utils";

const defaultConfig = {
  grid: {
    columnCount: 3
  }
}

const uiConfigAtom = atomWithStorage<typeof defaultConfig>('ui', defaultConfig, window.configStorage, { getOnInit: true });
export default uiConfigAtom;
