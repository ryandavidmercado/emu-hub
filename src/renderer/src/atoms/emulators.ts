import { Emulator } from '@common/types/Emulator'
import { arrayConfigAtoms } from './util/arrayConfigAtom'
import defaultEmulators from './defaults/emulators'

export default arrayConfigAtoms<Emulator>({
  storageKey: 'emulators',
  default: defaultEmulators,
  splitUserEntries: {
    arrOverrides: {
      args: "overwrite",
    }
  }
})
