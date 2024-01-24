import { Atom, atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import deepEqual from "fast-deep-equal";
import games from "./games"
import { System, SystemWithGames, SystemStore } from "@common/types";
import { sort } from "fast-sort";

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
  return sort(systems.map<SystemWithGames>(system => {
    const gamesList = get(games.lists.system(system.id))
    const randomScreenshot = gamesList.filter(game => game.screenshot).toSorted(() => Math.random() - .5)[0]?.screenshot

    return {
      ...system,
      screenshot: randomScreenshot,
      games: gamesList
    }
  })).asc([
    sys => sys.company,
    sys => sys.handheld ? 1 : 0,
    sys => sys.releaseYear
  ])
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
