import { atom } from "jotai";
import systems from "./systems";
import emulators from "./emulators";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import { atomFamily } from "jotai/utils";
import notifications from "./notifications";
import { ScreenScraper } from "@renderer/apiWrappers/ScreenScraper";
import screenScraperAtom from "./screenscaper";
import deepEqual from "fast-deep-equal"
import { landingKeyAtom } from "@renderer/pages/Landing";

export interface MediaTypes {
  poster?: string,
  hero?: string,
  logo?: string,
  screenshot?: string
}

export type Game = {
  id: string
  romname: string
  system: string
  rompath?: string[]
  players?: string
  description?: string
  lastPlayed?: string
  timesPlayed?: number
  developer?: string
  publisher?: string
  genre?: string
  name?: string
  added?: string
} & MediaTypes

const mainAtoms = arrayConfigAtoms<Game>({ storageKey: 'games' });

const scanGamesAtom = atom(null,
  (_, set) => {
    const newGames = window.scanRoms(true);
    set(mainAtoms.lists.all, newGames)
    set(landingKeyAtom, (key) => Number(!key)) // re-render the landing page when we rescan
  }
)

const recentsAtom = atom((get) => {
  const games = get(mainAtoms.lists.all);
  return games
    .filter(game => game.lastPlayed)
    .sort((a, b) =>
      new Date(b.lastPlayed!).valueOf() - new Date(a.lastPlayed!).valueOf()
    )
    .slice(0, 8)
});

const newGamesAtom = atom((get) => {
  const games = get(mainAtoms.lists.all);
  return games
    .filter(game => game.added && !game.lastPlayed)
    .filter((game) =>
      // 172800000: 2 days in milliseconds
      new Date().getTime() - new Date(game.added!).getTime() < 172800000
    )
    .sort((a, b) =>
      new Date(b.added!).valueOf() - new Date(a.added!).valueOf()
    )
    .slice(0, 10)
})

const launchGameAtom = atom(null, async (get, set, gameId: string) => {
  const systemsList = get(systems.lists.all);
  const game = get(mainAtoms.single(gameId))

  if(!game) throw new Error(`Tried to launch undefined game ID: ${gameId}`)

  const { system: gameSystem } = game;

  const system = systemsList.find(system => system.id === gameSystem);
  if(!system) throw new Error(`Tried to open game for undefined system: ${gameSystem}`);

  const emulatorId = system.emulators?.[0];
  const emulator = get(emulators.single(emulatorId ?? ""))

  if(!emulatorId || !emulator) throw new Error(`No emulators defined for system: ${system.id}`);

  set(mainAtoms.single(gameId), {
    timesPlayed: game.timesPlayed ? game.timesPlayed + 1 : 1,
    lastPlayed: new Date().toUTCString()
  })

  await window
    .launchGame(game, emulator);
})

const forSystemAtom = atomFamily((systemId: string, sortType = "alphabetical") => (
  atom((get) => {
    const games = get(mainAtoms.lists.all);
    const systemGames = games.filter(game => game.system === systemId)

    switch(sortType) {
      case "alphabetical":
        return systemGames.toSorted((a, b) => (a.name || a.romname).localeCompare(b.name || b.romname))
      default:
        return systemGames;
    }
  })
))

const downloadGameAtom = atom(null,
  async (get, set, systemId: string, { name, href }: { name: string, href: string }, autoScrape = false) => {
    const ssCreds = get(screenScraperAtom);
    const system = get(systems.single(systemId))
    if(!system) throw new Error(`Tried to download game for undefined system: ${systemId}`)

    set(notifications.add, {
      id: `dl-${name}`,
      text: `Downloading ${name}!`
    });

    let downloadedGame = await window.downloadGame(system, href);
    if(autoScrape) {
      const ss = new ScreenScraper({
        userId: ssCreds.username,
        userPassword: ssCreds.password
      });

      try {
        downloadedGame = await ss.scrapeByRomInfo(downloadedGame);
      } catch {}
    }

    set(mainAtoms.add, downloadedGame);
    set(notifications.add, {
      id: `dl-${downloadedGame.id}`,
      text: `Done downloading ${downloadedGame.name}!`
    })
  }
)

const scrapeGameAtom = atom(null,
  async (get, set, gameId: string) => {
    const ssCreds = get(screenScraperAtom);
    const game = get(mainAtoms.single(gameId))
    if(!game) throw new Error(`Tried to scrape undefined game: ${gameId}`);

    set(notifications.add, { id: `dl-${gameId}`, text: `Scraping ${game.name}!`})

    const ss = new ScreenScraper({ userId: ssCreds.username, userPassword: ssCreds.password });
    const finalGame = await ss.scrapeByRomInfo(game);

    set(mainAtoms.single(gameId), finalGame)
    set(notifications.add, { id: `dl-${gameId}-done`, text: `Done scraping ${game.name}!`})
  }
)

type ByAttributeProp = {
  attribute: keyof Game
  value?: string
  limit?: number;
  excludeId?: string;
}

const byAttributeAtom = atomFamily((config: ByAttributeProp) => atom(get => {
  if(!config.value) return [];
  const games = get(mainAtoms.lists.all);
  const byAttribute = games.filter(game =>
    game[config.attribute] === config.value
      && game.id !== config.excludeId
  );

  if(!config.limit) return byAttribute;

  const shuffled = byAttribute.toSorted(() => .5 - Math.random());
  return shuffled.slice(0, config.limit);
}), deepEqual)

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    recents: recentsAtom,
    new: newGamesAtom,
    system: forSystemAtom,
    byAttribute: byAttributeAtom
  },
  launch: launchGameAtom,
  scan: scanGamesAtom,
  download: downloadGameAtom,
  scrape: scrapeGameAtom
}
