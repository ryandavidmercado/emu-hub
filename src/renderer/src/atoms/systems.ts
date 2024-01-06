import { arrayConfigAtoms } from "./util/arrayConfigAtom";

export interface System {
  id: string,
  name: string,
  logo: string,
  emulators?: string[],
  fileExtensions: string[]
}

export default arrayConfigAtoms<System>({ storageKey: 'systems' });
