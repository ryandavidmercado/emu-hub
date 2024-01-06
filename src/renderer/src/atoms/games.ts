import { atom } from "jotai";
import systems from "./systems";
import emulators from "./emulators";
import { navigate } from "wouter/use-location";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import { atomFamily } from "jotai/utils";

export interface Game {
  id: string,
  players?: number,
  name?: string,
  poster?: string,
  hero?: string,
  logo?: string,
  description?: string,
  system: string
  lastPlayed?: string
  romname: string
  timesPlayed?: number
}

const mainAtoms = arrayConfigAtoms<Game>({ storageKey: 'games' });

const scanGamesAtom = atom(null,
  (_, set) => {
    const newGames = window.scanRoms();
    set(mainAtoms.lists.all, newGames)
  }
)

const recentsAtom = atom((get) => {
  const games = get(mainAtoms.lists.all);
  return games
    .filter(game => game.lastPlayed)
    .sort((a, b) =>
      new Date(b.lastPlayed!).valueOf() - new Date(a.lastPlayed!).valueOf()
    )
    .slice(0, 10)
});

const launchGameAtom = atom(null, (get, set, gameId: string) => {
  const systemsList = get(systems.lists.all);
  const game = get(mainAtoms.single(gameId))

  if(!game) throw new Error(`Tried to launch undefined game ID: ${gameId}!`)

  const { system: gameSystem } = game;

  const system = systemsList.find(system => system.id === gameSystem);
  if(!system) throw new Error(`Tried to open game for undefined system: ${gameSystem}`);

  const emulatorId = system.emulators?.[0];
  const emulator = get(emulators.single(emulatorId ?? ""))

  if(!emulatorId || !emulator) throw new Error(`No emulators defined for system: ${system.id}`);

  set(mainAtoms.lists.immerized, draft => {
    const gameIndex = draft.findIndex(game => game.id === gameId);
    if(gameIndex === -1) {
      return console.error("Tried to update invalid game ID!")
    }

    draft[gameIndex] = {
      ...game,
      timesPlayed: game.timesPlayed ? game.timesPlayed + 1 : 1,
      lastPlayed: new Date().toUTCString()
    }
  })

  navigate("/ingame");
  return window
    .launchGame(game, emulator)
    .then(() => { history.back() })
})

const forSystemAtom = atomFamily((systemId: string) => (
  atom((get) => {
    const games = get(mainAtoms.lists.all);
    return games.filter(game => game.system === systemId)
  })
))

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    recents: recentsAtom,
    system: forSystemAtom
  },
  launch: launchGameAtom,
  scan: scanGamesAtom
}
