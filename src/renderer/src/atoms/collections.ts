import { atomFamily } from "jotai/utils";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import { atom } from "jotai";
import games from "./games";
import { Game } from "@common/types"

interface Collection {
  id: string;
  name: string;
  games: string[];
}

const mainAtoms = arrayConfigAtoms<Collection>({ default: [], storageKey: "collections" });
const allWithGames = atom((get) => {
  const collections = get(mainAtoms.lists.all);
  return collections.map(collection => ({
    ...collection,
    games: collection.games.map(game => get(games.single(game))).filter<Game>((game): game is Game => Boolean(game))
  }))
})

const getWithGames = atomFamily((id: string) => atom((get) => {
  const collection = get(allWithGames).find(collection => collection.id === id);
  if(!collection) return null

  return collection;
}))

const curriedGetWithGames = atom((get) => (id: string) => get(getWithGames(id)));

const addGame = atom(null, (get, set, collectionId: string, gameId: string) => {
  const collection = get(mainAtoms.single(collectionId));
  if(!collection) return;

  const currentGames = collection.games;
  set(mainAtoms.single(collectionId), {
    games: [...currentGames, gameId]
  })
})

const removeGame = atom(null, (get, set, collectionId: string, gameId: string) => {
  const collection = get(mainAtoms.single(collectionId));
  if(!collection) throw `Tried to add game to invalid collection: ${collectionId}`

  const currentGames = collection.games;
  set(mainAtoms.single(collectionId), {
    games: currentGames.filter(game => game !== gameId)
  })
})

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    withGames: allWithGames
  },
  single: {
    base: mainAtoms.single,
    withGames: getWithGames,
    curriedWithGames: curriedGetWithGames
  },
  addGame,
  removeGame
}
