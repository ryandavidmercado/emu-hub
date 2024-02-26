import { atomFamily, atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import ShortUniqueId from 'short-unique-id'
import { PartialBy } from '@renderer/types/util'
import deepmerge from 'deepmerge'

const uid = new ShortUniqueId()

type ArrOverride = "overwrite" | "mergeById" | "combine"
type ArrOverrides = {
  [key: string]: ArrOverride
}

const prepareIdArrMerge = <T extends { id: string }>(defaults: T[], user: (Partial<T> & { id: string })[]) => {
  const ids = new Set([...defaults.map(d => d.id), ...user.map(d => d.id)]);

  const getLookup = (entries: (Partial<T> & { id: string })[]) => {
    return entries.reduce((acc, entry) => ({
      ...acc,
      [entry.id]: entry
    }), {} as Record<string, (Partial<T> & { id: string })>)
  }

  const defaultsLookup = getLookup(defaults);
  const userLookup = getLookup(user);

  return { ids, defaultsLookup, userLookup }
}

const merger = <T extends { id: string }>(defaults: T[], user: (Partial<T> & { id: string })[], arrOverrides: ArrOverrides) => {
  const { ids, defaultsLookup, userLookup } = prepareIdArrMerge(defaults, user);

  const arrMergers = {
    overwrite: (_defaultEntry: any[], userEntry: any[]) => userEntry,
    mergeById: (defaultEntry: any[], userEntry: any[]) => {
      const { ids, defaultsLookup, userLookup } = prepareIdArrMerge(defaultEntry, userEntry)
      return [...ids].map(id => deepmerge(defaultsLookup[id] ?? {}, userLookup[id] ?? {}))
    },
    combine: (defaultEntry: any[], userEntry: any[]) => [...new Set([...defaultEntry, ...userEntry])]
  } as const

  const merged = [...ids].map(id => {
    return deepmerge(defaultsLookup[id] ?? {}, userLookup[id] ?? {}, {
      customMerge: (key) => {
        if (key in arrOverrides) return arrMergers[arrOverrides[key]]
        return undefined;
      }
    })
  })

  return merged as T[];
}

interface ArrayConfigOptions<T> {
  storageKey: string
  default?: T[],
  splitUserEntries?: {
    arrOverrides: ArrOverrides
  }
}

export const arrayConfigAtoms = <T extends { id: string }>(options: ArrayConfigOptions<T>) => {
  const userEntriesAtom = atomWithStorage<(Partial<T> & { id: string })[]>(
    options.storageKey,
    ((options.splitUserEntries ? [] : options.default) ?? []) as (Partial<T> & { id: string })[],
    window.configStorage,
    { getOnInit: true }
  )

  if(options.splitUserEntries) {
    window.writeDefaultConfig(options.storageKey, options.default ?? [])
  }

  const all = atom(
    (get) => {
      const userEntries = get(userEntriesAtom);
      if (!options.splitUserEntries) return userEntries as T[];

      return merger(options.default ?? [], userEntries, options.splitUserEntries.arrOverrides) as T[]
    },
    (_, set, newEntries: T[]) => {
      set(userEntriesAtom, newEntries)
    }
  )

  const lookup = atom(
    (get) => {
      return get(all).reduce((acc, entry) => ({ ...acc, [entry.id]: entry }), {} as Record<string, T>)
    }
  )

  const single = atomFamily((id: string) =>
    atom(
      (get) => {
        return get(lookup)[id] as T | undefined;
      },
      (_, set, update: Partial<Omit<T, 'id'>>) => {
        set(userEntriesAtom, (userEntries): (Partial<T> & { id: string })[] => {
          const draftEntryIndex = userEntries.findIndex(e => e.id === id);

          if(draftEntryIndex !== -1) {
            return userEntries.map(e => {
              if(e.id !== id) return e;
              return { ...e, ...update }
            })
          } else {
            return [...userEntries, { ...update, id } as Partial<T> & { id: string }]
          }
        })
      }
    )
  )

  const curriedSingle = atom(
    (get) => (id: string) => get(single(id)),
    (_, set, update: Partial<T> & { id: string }) => set(single(update.id), update)
  )

  const add = atom(null, (get, set, newElem: PartialBy<T, 'id'>) => {
    const currentEntry = get(single(newElem.id ?? ''))
    if (currentEntry) return

    set(userEntriesAtom, (elems) => [
      ...elems,
      {
        ...newElem,
        id: newElem.id ?? uid.rnd()
      } as T
    ])
  })

  const remove = atom(null, (_, set, id: string) => {
    set(userEntriesAtom, (elems) => elems.filter((elem) => elem.id !== id))
  })

  return {
    lists: {
      all,
    },
    single,
    curriedSingle,
    add,
    remove
  }
}
