import { ColorSchemeId } from '@renderer/colors/colorSchemes'
import { objConfigAtom } from './util/objConfigAtom'

interface UIConfig {
  grid: {
    columnCount: number
  }
  colorScheme: ColorSchemeId
}

const defaultConfig: UIConfig = {
  grid: {
    columnCount: 3
  },
  colorScheme: 'default'
}

const uiConfigAtom = objConfigAtom({ defaults: defaultConfig, storageKey: 'ui' })
export default uiConfigAtom
