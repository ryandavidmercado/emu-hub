import { MainPaths } from '@common/types/Paths'
import { objConfigAtom } from './util/objConfigAtom'
import defaultPaths from './defaults/paths'

const pathConfigAtom = objConfigAtom<MainPaths>({ storageKey: 'paths', defaults: defaultPaths })
export default pathConfigAtom
