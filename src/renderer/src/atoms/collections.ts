import { atomFamily } from "jotai/utils";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import { atom } from "jotai";
import games, { Game } from "./games";

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
  if(!collection) throw(`Tried to access collection with invalid ID: ${id}`);

  return collection;
}))

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    withGames: allWithGames
  },
  single: {
    base: mainAtoms.single,
    withGames: getWithGames
  }
}
