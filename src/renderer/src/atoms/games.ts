import { atom } from "jotai";
import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";
import { systemsAtom } from "./systems";

export interface Game {
  id: string,
  players: number,
  name: string,
  poster?: string,
  hero: string,
  logo: string,
  description: string,
  system: string
  lastPlayed: string
  romname: string
}

const gamesAtom = atomWithStorage<Game[]>('games', [], window.configStorage, { getOnInit: true })
const readonlyGamesAtom = atom((get) => get(gamesAtom));
const immerizedGamesAtom = withImmer(gamesAtom);

const updateGameAtom = atom(null,
  (_, set, id: string, update: Partial<Omit<Game, "id>">>) => {
    set(immerizedGamesAtom, (draft) => {
      const gameIndex = draft.findIndex(game => game.id === id);
      if(gameIndex === -1) {
        return console.error("Tried to update invalid game ID!")
      }

      draft[gameIndex] = {
        ...draft[gameIndex],
        ...update
      }
    })
  }
)

const recentsAtom = atom((get) => {
  const games = get(gamesAtom);
  return games
    .filter(game => game.lastPlayed)
    .sort((a, b) =>
      new Date(b.lastPlayed).valueOf() - new Date(a.lastPlayed).valueOf()
    )
});

const launchGameAtom = atom((get) => {
  const games = get(readonlyGamesAtom);
  const systems = get(systemsAtom);

  return (gameId: Game["id"]) => {
    const game = games.find(game => game.id === gameId);
    if(!game) throw new Error(`Tried to launch undefined game ID: ${gameId}!`)

    const { romname, system: gameSystem } = game;

    const system = systems.find(system => system.id === gameSystem);
    if(!system) throw new Error(`Tried to open game for undefined system: ${gameSystem}`);

    const emulator = system.emulators?.[0];
    if(!emulator) throw new Error(`No emulators defined for system: ${system.id}`);

    return window.launchGame(romname, system.id, emulator)
  }
})


export default {
  lists: {
    all: readonlyGamesAtom,
    recents: recentsAtom
  },
  update: updateGameAtom,
  launch: launchGameAtom
}
