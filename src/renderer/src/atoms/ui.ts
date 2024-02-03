import { objConfigAtom } from "./util/objConfigAtom";

const defaultConfig = {
  grid: {
    columnCount: 3
  }
}

const uiConfigAtom = objConfigAtom({ defaults: defaultConfig, storageKey: 'ui' });
export default uiConfigAtom;
