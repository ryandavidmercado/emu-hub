import { atom } from "jotai";
import { mainAtoms as systemMainAtoms } from "./systems";
import emulators from "./emulators";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import { atomFamily } from "jotai/utils";
import notifications from "./notifications";
import { ScreenScraper } from "@renderer/apiWrappers/ScreenScraper";
import screenScraperAtom from "./screenscaper";
import deepEqual from "fast-deep-equal"
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId();

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
  const systemsList = get(systemMainAtoms.lists.all);
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

  return window
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
  async (get, set, systemId: string, { name, href }: { name: string, href: string }) => {
    const system = get(systemMainAtoms.single(systemId))
    if(!system) throw new Error(`Tried to download game for undefined system: ${systemId}`)

    const notificationId = `dl-${name}-${uid.rnd()}`

    set(notifications.add, {
      id: notificationId,
      text: `Downloading ${name}!`,
      type: "download"
    });

    try {
      const downloadedGame = await window.downloadGame(system, href);
      set(mainAtoms.add, downloadedGame);
      set(notifications.update, {
        id: notificationId,
        text: `Done downloading ${downloadedGame.name}!`,
        type: "success"
      })
    } catch {
       set(notifications.update, {
        id: notificationId,
        text: `Failed to download ${name}`,
        type: "error"
      })
    }
  }
)

const scrapeGameAtom = atom(null,
  async (get, set, gameId: string) => {
    const ssCreds = get(screenScraperAtom);
    const game = get(mainAtoms.single(gameId))
    if(!game) throw new Error(`Tried to scrape undefined game: ${gameId}`);

    const notificationId = `dl-${game.id}-${uid.rnd()}`

    set(notifications.add, {
      id: notificationId,
      text: `Scraping ${game.name}!`,
      type: "download"
    })

    const ss = new ScreenScraper({ userId: ssCreds.username, userPassword: ssCreds.password });

    try {
      const finalGame = await ss.scrapeByRomInfo(game)
      set(mainAtoms.single(gameId), finalGame)
      set(notifications.update, {
        id: notificationId,
        text: `Done scraping ${game.name}!`,
        type: "success"
      });
    } catch {
      set(notifications.update, {
        id: notificationId,
        text: `Failed to scrape ${game.name}`,
        type: "error"
      })
    }
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
