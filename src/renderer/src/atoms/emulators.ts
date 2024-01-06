import { arrayConfigAtoms } from "./util/arrayConfigAtom";

export type Emulator = {
  id: string
  name: string
} & ({
  core: string
} | {
  bin: string
})

export default arrayConfigAtoms<Emulator>({ storageKey: "emulators" });
