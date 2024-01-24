import { atomFamily, atomWithStorage } from "jotai/utils";
import { withImmer } from "jotai-immer";
import { atom } from "jotai";
import ShortUniqueId from "short-unique-id";
import { PartialBy } from "@renderer/types/util";

interface ArrayConfigOptions<T> {
  storageKey: string,
  default?: T[]
}

const uid = new ShortUniqueId;

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
        const entry = entries.find(entry => entry.id == id);

        return entry;
      },
      (_, set, update: Partial<Omit<T, "id">>) => {
        set(immerized, (draft) => {
          const entryIndex = draft.findIndex(emulator => emulator.id === id);
          if(entryIndex === -1) {
            throw `Tried to update invalid ${options.storageKey} ID!`
          }

          draft[entryIndex] = {
            ...draft[entryIndex],
            ...update
          }
        })
      }
    )
  )

  const curriedSingle = atom((get) => (id: string) => get(single(id)))

  const add = atom(null,
    (get, set, newElem: PartialBy<T, "id">) => {
      const currentEntry = get(single(newElem.id ?? ""));
      if(currentEntry) return;

      set(all, (elems) => [...elems, {
        ...newElem,
        id: newElem.id ?? uid.rnd(),
      } as T])
    }
  )

  const remove = atom(null,
    (_, set, id: string) => {
      set(all, (elems) => elems.filter(elem => elem.id !== id))
    }
  )

  return {
    lists: {
      all,
      immerized
    },
    single,
    curriedSingle,
    add,
    remove
  }
}
