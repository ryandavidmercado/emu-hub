import { atom } from "jotai";
import { mainAtoms as systemMainAtoms } from "./systems";
import { Game, MediaTypes, StoreEntry } from "@common/types";
import emulators from "./emulators";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";
import { atomFamily } from "jotai/utils";
import notifications from "./notifications";
import { ScreenScraper } from "@renderer/apiWrappers/ScreenScraper";
import screenScraperAtom from "./screenscaper";
import deepEqual from "fast-deep-equal"

const mainAtoms = arrayConfigAtoms<Game>({ storageKey: 'games' });

const scanGamesAtom = atom(null,
  (_, set) => {
    const newGames = window.scanRoms(true);
    set(mainAtoms.lists.all, newGames)
  }
)

const recentlyViewedAtom = atom((get) => {
  const games = get(mainAtoms.lists.all);
  return games
    .filter(game => {
      if (!game.lastViewed) return false; // if we haven't viewed this game, don't include it
      if (!game.lastPlayed) return true; // if we haven't played this game yet (and we've viewed it), include it

      // only include this game if our last played is before our last viewed
      // from the user's perspective, this "promotes" a game from Recently Viewed to Continue Playing when we launch it
      return (
        new Date(game.lastPlayed).getTime() < new Date(game.lastViewed).getTime()
      )
    })
    .sort((a, b) =>
      new Date(b.lastViewed!).valueOf() - new Date(a.lastViewed!).valueOf()
    )
    .slice(0, 8)
});

const recentlyPlayedAtom = atom((get) => {
  const games = get(mainAtoms.lists.all);
  return games
    .filter(game => game.lastPlayed)
    .sort((a, b) =>
      new Date(b.lastPlayed!).valueOf() - new Date(a.lastPlayed!).valueOf()
    )
    .slice(0, 8)
});

const recentlyAddedAtom = atom((get) => {
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
    .slice(0, 8)
})

const launchGameAtom = atom(null, async (get, set, gameId: string) => {
  const systemsList = get(systemMainAtoms.lists.all);
  const game = get(mainAtoms.single(gameId))

  if (!game) throw new Error(`Tried to launch undefined game ID: ${gameId}`)

  const { system: gameSystem } = game;

  const system = systemsList.find(system => system.id === gameSystem);
  if (!system) throw new Error(`Tried to open game for undefined system: ${gameSystem}`);

  const emulatorId = system.emulators?.[0];
  const emulator = get(emulators.single(emulatorId ?? ""))

  if (!emulatorId || !emulator) throw new Error(`No emulators defined for system: ${system.id}`);

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

    switch (sortType) {
      case "alphabetical":
        return systemGames.toSorted((a, b) => (a.name || a.romname).localeCompare(b.name || b.romname))
      default:
        return systemGames;
    }
  })
))

const downloadGameAtom = atom(null,
  async (get, set, systemId: string, { name, href, description, genre, media }: StoreEntry) => {
    const system = get(systemMainAtoms.single(systemId))
    if (!system) throw new Error(`Tried to download game for undefined system: ${systemId}`)

    const notificationId = `dl-${system}-${name}`;

    set(notifications.add, {
      id: notificationId,
      text: `Downloading ${name}!`,
      type: "download",
      timeout: 0
    });

    try {
      let downloadedGame = await window.downloadGame(system, href);
      downloadedGame = {
        ...downloadedGame,
        name: name ?? downloadedGame.name,
        description,
        genre
      }

      try {
        if (media) downloadedGame = await window.downloadGameMedia(
          downloadedGame,
          Object.entries(media).map(([mediaType, data]) => ({
            mediaType: mediaType as keyof MediaTypes,
            ...data
          }))
        )
      } catch { }

      set(mainAtoms.add, downloadedGame);
      set(notifications.remove, notificationId);
      set(notifications.add, {
        id: `${notificationId}-success`,
        text: `Done downloading ${downloadedGame.name}!`,
        type: "success"
      })
    } catch {
      set(notifications.remove, notificationId);
      set(notifications.add, {
        id: `${notificationId}-error`,
        text: `Failed to download ${name}`,
        type: "error"
      })
    }
  }
)

interface ScrapeSettings {
  gameId: string
  extraText?: string
}

const scrapeGameAtom = atom(null,
  async (get, set, { gameId, extraText }: ScrapeSettings) => {
    const ssCreds = get(screenScraperAtom);
    const game = get(mainAtoms.single(gameId))
    if (!game) throw new Error(`Tried to scrape undefined game: ${gameId}`);

    const notificationId = `scrape-${game.id}`;

    set(notifications.add, {
      id: notificationId,
      text: `Scraping ${game.name}!${extraText ?? ""}`,
      type: "download",
      timeout: 0
    })

    const ss = new ScreenScraper({ userId: ssCreds.username, userPassword: ssCreds.password });

    try {
      const finalGame = await ss.scrapeByRomInfo(game)
      set(mainAtoms.single(gameId), finalGame)
      set(notifications.remove, notificationId);
      set(notifications.add, {
        id: `${notificationId}-done`,
        text: `Done scraping ${game.name}!`,
        type: "success"
      });
    } catch (e) {
      const err = e as { crc: string, size: string }
      set(mainAtoms.single(gameId), {
        crc: err.crc,
        romsize: err.size
      })
      set(notifications.remove, notificationId);
      set(notifications.add, {
        id: `${notificationId}-error`,
        text: `Failed to scrape ${game.name}`,
        type: "error"
      })
    }
  }
)

interface ScrapeAllGamesSettings {
  excludeNotMissing: boolean,
}

const scrapeAllGamesAtom = atom(null, async (get, set, settings: ScrapeAllGamesSettings) => {
  let gamesList = get(mainAtoms.lists.all);
  if (settings.excludeNotMissing) {
    gamesList = gamesList.filter(game => !game.hero && !game.screenshot && !game.logo)
  }

  for (const [index, game] of gamesList.entries()) {
    await set(scrapeGameAtom, {
      gameId: game.id,
      extraText: ` (${index + 1} / ${gamesList.length})`
    })
  }
})

type ByAttributeProp = {
  attribute: keyof Game
  value?: string
  limit?: number;
  excludeId?: string;
}

const byAttributeAtom = atomFamily((config: ByAttributeProp) => atom(get => {
  if (!config.value) return [];
  const games = get(mainAtoms.lists.all);
  const byAttribute = games.filter(game =>
    game[config.attribute] === config.value
    && game.id !== config.excludeId
  );

  if (!config.limit) return byAttribute;

  const shuffled = byAttribute.toSorted(() => .5 - Math.random());
  return shuffled.slice(0, config.limit);
}), deepEqual);

const removeAtom = atom(null, (get, set, id: string) => {
  const game = get(mainAtoms.single(id));
  if (!game) return;

  window.removeGameFiles(game);
  set(mainAtoms.remove, id);
})

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    recentlyViewed: recentlyViewedAtom,
    recentlyPlayed: recentlyPlayedAtom,
    recentlyAdded: recentlyAddedAtom,
    system: forSystemAtom,
    byAttribute: byAttributeAtom
  },
  launch: launchGameAtom,
  scan: scanGamesAtom,
  download: downloadGameAtom,
  scrape: scrapeGameAtom,
  scrapeAll: scrapeAllGamesAtom,
  remove: removeAtom
}
