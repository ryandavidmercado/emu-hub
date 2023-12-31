import { atomWithStorage } from "jotai/utils";
export interface System {
  id: number,
  name: string,
  logo: string,
}

export const systemsAtom = atomWithStorage<System[]>('systems', [], window.configStorage, { getOnInit: true })
