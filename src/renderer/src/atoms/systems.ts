import { atomWithStorage } from "jotai/utils";
export interface System {
  id: string,
  name: string,
  logo: string,
  emulators?: string[]
}

export const systemsAtom = atomWithStorage<System[]>('systems', [], window.configStorage, { getOnInit: true })
