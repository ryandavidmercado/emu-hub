import { Atom, atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import deepEqual from "fast-deep-equal";
import games, { Game, MediaTypes } from "./games"

export type SystemStore = {
  id: string
  name: string
} & ({
  type: "html"
  url: string
  selector: string
} | ({
  type: "emudeck"
}))

export interface StoreEntry {
  href: string,
  name: string,
  description?: string,
  genre?: string,
  media?: Record<keyof MediaTypes, {
    url: string,
    format: string
  }>
}

export interface System {
  id: string,
  ssId?: string,
  name: string,
  logo: string,
  emulators?: string[],
  fileExtensions: string[]
  stores?: SystemStore[]
}

export type SystemWithGames = System & { games: Game[], hero?: string }

export const mainAtoms = arrayConfigAtoms<System>({ storageKey: 'systems' });

interface GetStoreParms {
  systemId: string,
  storeId: string
}

const getStoreAtom = atomFamily(
  (params: GetStoreParms) => atom((get) => {
    const system = get(mainAtoms.single(params.systemId));
    if(!system) throw `Tried to get store for undefined system ID: ${params.systemId}`

    const store = system.stores?.find(store => store.id === params.storeId);
    if(!store) throw `Tried to get store for undefined store ID: ${params.storeId} (system: ${params.systemId})`

    return store;
  }),
  deepEqual
)

interface LoadStoreProps {
  storeData: SystemStore,
  systemId: string
}

const loadStoreAtom = atomFamily(
  (props: LoadStoreProps) => loadable(
    atom(async (_) => {
      const contents = await window.loadSystemStore(props.storeData, props.systemId)
      console.log(contents)
      return contents;
    })
  ),
  deepEqual
)

const systemsWithStoresAtom = atom((get) => {
  const systems = get(mainAtoms.lists.all);
  return systems.filter(system => system.stores?.length);
})

const systemsWithGamesAtom = atom((get) => {
  const systems = get(mainAtoms.lists.all);
  return systems.map<SystemWithGames>(system => {
    const gamesList = get(games.lists.system(system.id))
    const randomScreenshot = gamesList.filter(game => game.screenshot).toSorted(() => Math.random() - .5)[0]?.screenshot

    return {
      ...system,
      hero: randomScreenshot,
      games: gamesList
    }
  })
}) as Atom<SystemWithGames[]>

const onlySystemsWithGamesAtom = atom((get) => {
  const systemsWithGames = get(systemsWithGamesAtom);
  return systemsWithGames.filter(system => system.games.length);
})

const systemWithGamesAtom = atomFamily((id: string) => atom((get) => {
  return get(systemsWithGamesAtom).find(system => system.id === id)
}))

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    withStores: systemsWithStoresAtom,
    withGames: systemsWithGamesAtom,
    onlyWithGames: onlySystemsWithGamesAtom
  },
  store: {
    get: getStoreAtom,
    load: loadStoreAtom
  },
  withGames: systemWithGamesAtom
}
