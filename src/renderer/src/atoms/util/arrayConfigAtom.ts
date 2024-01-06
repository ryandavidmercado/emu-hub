import { atomFamily, atomWithStorage } from "jotai/utils";
import { withImmer } from "jotai-immer";
import { atom } from "jotai";

interface ArrayConfigOptions<T> {
  storageKey: string,
  default?: T[]
}

export const arrayConfigAtoms = <T extends { id: string }>(options: ArrayConfigOptions<T>) => {
  const all = atomWithStorage<T[]>(
    options.storageKey,
    options.default ?? [] as T[],
    window.configStorage,
    { getOnInit: true }
  )

  const immerized = withImmer(all);

  const single = atomFamily((id: string) =>
    atom(
      (get) => {
        const entries = get(all);
        return entries.find(entry => entry.id == id)
      },
      (_, set, update: Partial<Omit<T, "id">>) => {
        set(immerized, (draft) => {
          const emulatorIndex = draft.findIndex(emulator => emulator.id === id);
          if(emulatorIndex === -1) {
            return console.error("Tried to update invalid emulator ID!")
          }

          draft[emulatorIndex] = {
            ...draft[emulatorIndex],
            ...update
          }
        })
      }
    )
  )

  return {
    lists: {
      all,
      immerized
    },
    single
  }
}
