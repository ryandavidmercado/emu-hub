import { atom, useAtom } from "jotai";
import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
export interface Game {
  id: number,
  players: number,
  name: string,
  poster?: string,
  hero: string,
  logo: string,
  description: string,
  system: string
  lastPlayed: string
}

const gamesAtom = atomWithStorage<Game[]>('games', [], window.configStorage, { getOnInit: true })
const immerizedGamesAtom = withImmer(gamesAtom) ;

const recentsAtom = atom((get) => {
  const games = get(gamesAtom);
  return games
    .filter(game => game.lastPlayed)
    .sort((a, b) =>
      new Date(b.lastPlayed).valueOf() - new Date(a.lastPlayed).valueOf()
    )
});

export const useUpdateGame = (id: number | null) => {
  const [_, setGames] = useAtom(immerizedGamesAtom)

  return useCallback((gameUpdate: Partial<Game>) => {
    if(id === null) return;

    setGames((draft) => {
      const gameIndex = draft.findIndex(game => game.id === id);
      if(gameIndex === -1) return;

      draft[gameIndex] = {
        ...draft[gameIndex],
        ...gameUpdate
      }
    })
  }, [id])
}

export default {
  list: immerizedGamesAtom,
  recents: recentsAtom,
}
