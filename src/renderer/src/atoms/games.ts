import { atom } from 'jotai'
import { mainAtoms as systemMainAtoms } from './systems'
import { appConfigAtom } from './appConfig'
import { Game, MediaTypes, StoreEntry } from '@common/types'
import emulators from './emulators'
import { arrayConfigAtoms } from './util/arrayConfigAtom'
import { atomFamily } from 'jotai/utils'
import notifications from './notifications'
import { ScreenScraper } from '@renderer/apiWrappers/ScreenScraper'
import deepEqual from 'fast-deep-equal'
import uFuzzy from '@leeoniya/ufuzzy'
import { IGDB } from '@renderer/apiWrappers/IGDB'
import { runningGameAtom } from './runningGame'

const mainAtoms = arrayConfigAtoms<Game>({ storageKey: 'games' })
const PseudoRandom = () => {
  let map = {}
  return {
    pseudoRandom: (input: string | number) => {
      if(map[input]) return map[input];

      const newRandom = Math.random()
      map[input] = newRandom

      return newRandom
    },
    resetPseudoRandom: () => map = {}
  }
}

const { pseudoRandom, resetPseudoRandom } = PseudoRandom()

const scanGamesAtom = atom(null, async (get, set) => {
  const newGames = await window.scanRoms(
    get(appConfigAtom).paths,
    get(systemMainAtoms.lists.all),
    get(mainAtoms.lists.all)
  )

  set(mainAtoms.lists.all, newGames)

  return newGames.length
})

const recentlyPlayedAtom = atom((get) => {
  const games = get(mainAtoms.lists.all)
  return games
    .filter((game) => game.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed!).valueOf() - new Date(a.lastPlayed!).valueOf())
    .slice(0, 10)
})

const recentlyAddedAtom = atom((get) => {
  const games = get(mainAtoms.lists.all)
  return games
    .filter((game) => game.added && !game.lastPlayed)
    .filter(
      (game) =>
        // 86400000: 1 day in milliseconds
        new Date().getTime() - new Date(game.added!).getTime() < 86400000
    )
    .sort((a, b) => new Date(b.added!).valueOf() - new Date(a.added!).valueOf())
    .slice(0, 10)
})

interface RecentlyViewedFilters {
  played?: boolean
  added?: boolean
}

interface RecommendedOptions {
  baseGame?: Game
  excludedRecentlyPlayed?: boolean
}

const recommendedAtom = atomFamily((options?: RecommendedOptions) => atom((get) => {
  const getAllRecommendations = (game: Game) => {
    const recentlyPlayed = get(recentlyPlayedAtom)
    const recommendationTypes = ['genre', 'developer', 'publisher'] as const
    const getRecommendations = (type: (typeof recommendationTypes)[number]) => get(byAttributeAtom({
      limit: 10,
      attribute: type,
      excludeId: options?.excludedRecentlyPlayed ? [game.id, ...recentlyPlayed.map(g => g.id)] : game.id,
      value: game[type],
      shuffle: false
    }))

    const labelMap = {
      'genre': `Recommended (Genre: ${game.genre})`,
      'developer': `Recommended (Developed by ${game.developer})`,
      'publisher': `Recommended (Published by ${game.publisher})`
    }

    const recommendations = recommendationTypes
      .map(recommendationType => ({
        games: getRecommendations(recommendationType),
        label: labelMap[recommendationType]
      }))
      .filter(recs => recs.games?.length)

    return recommendations
  }

  if(options?.baseGame) return getAllRecommendations(options?.baseGame)
  const baseCandidates = get(recentlyPlayedAtom)
    .filter(game => game.genre || game.developer || game.publisher)
    .toSorted((a, b) => 0.5 - (.5 * (pseudoRandom(a.id) + pseudoRandom(b.id))))

  for(let game of baseCandidates) {
    const recommendations = getAllRecommendations(game);
    if(recommendations.length) return recommendations
  }

  return []
}), deepEqual)

const recentlyViewedAtom = atomFamily(
  (filter: RecentlyViewedFilters) =>
    atom((get) => {
      const games = get(mainAtoms.lists.all)
      const playedIds = new Set(get(recentlyPlayedAtom).map((g) => g.id))
      const addedIds = new Set(get(recentlyAddedAtom).map((g) => g.id))

      return games
        .filter((game) => {
          if (!game.lastViewed) return false

          if (filter.played && playedIds.has(game.id)) return false
          if (filter.added && addedIds.has(game.id)) return false

          return true
        })
        .sort((a, b) => new Date(b.lastViewed!).valueOf() - new Date(a.lastViewed!).valueOf())
        .slice(0, 10)
    }),
  deepEqual
)

const launchGameAtom = atom(null, async (get, set, gameId: string) => {
  const systemsList = get(systemMainAtoms.lists.all)
  const game = get(mainAtoms.single(gameId))

  if (!game) throw new Error(`Tried to launch undefined game ID: ${gameId}`)

  const { system: gameSystem } = game

  const system = systemsList.find((system) => system.id === gameSystem)
  if (!system) throw new Error(`Tried to open game for undefined system: ${gameSystem}`)

  const emulatorId = game.emulator ?? system.emulators?.[0]
  const emulator = get(emulators.single(emulatorId ?? ''))

  if (!emulatorId || !emulator) throw new Error(`No emulators defined for system: ${system.id}`)

  set(mainAtoms.single(gameId), {
    timesPlayed: game.timesPlayed ? game.timesPlayed + 1 : 1,
    lastPlayed: new Date().toUTCString()
  })

  const launchedGame = await window.launchGame(game, emulator, system);
  set(runningGameAtom, launchedGame)

  resetPseudoRandom()
  return launchedGame
})

const forSystemAtom = atomFamily((systemId: string, sortType = 'alphabetical') =>
  atom((get) => {
    const games = get(mainAtoms.lists.all)
    const systemGames = games.filter((game) => game.system === systemId)

    switch (sortType) {
      case 'alphabetical':
        return systemGames.toSorted((a, b) =>
          (a.name || a.romname).localeCompare(b.name || b.romname)
        )
      default:
        return systemGames
    }
  })
)

const downloadGameAtom = atom(
  null,
  async (get, set, systemId: string, { name, href, description, genre, media }: StoreEntry) => {
    const system = get(systemMainAtoms.single(systemId))
    if (!system) throw new Error(`Tried to download game for undefined system: ${systemId}`)

    const notificationId = `dl-${system}-${name}`

    set(notifications.add, {
      id: notificationId,
      text: `Downloading ${name}!`,
      type: 'download',
      timeout: 0
    })

    try {
      let downloadedGame = await window.downloadGame(system, href, get(appConfigAtom).paths, name)

      downloadedGame = {
        ...downloadedGame,
        description,
        genre
      }

      try {
        if (media)
          downloadedGame = await window.downloadGameMedia(
            downloadedGame,
            Object.entries(media).map(([mediaType, data]) => ({
              mediaType: mediaType as keyof MediaTypes,
              ...data
            }))
          )
      } catch (e) {
        set(notifications.add, {
          id: `${notificationId}-error`,
          text: `Failed to download media for ${name}: ${e}`,
          type: 'error'
        })
      }

      set(mainAtoms.add, downloadedGame)
      set(notifications.remove, notificationId)
      set(notifications.add, {
        id: `${notificationId}-success`,
        text: `Done downloading ${downloadedGame.name}!`,
        type: 'success'
      })
    } catch (e) {
      set(notifications.remove, notificationId)
      set(notifications.add, {
        id: `${notificationId}-error`,
        text: `Failed to download ${name}: ${e}`,
        type: 'error'
      })
    }
  }
)

interface ScrapeSettings {
  gameId: string
  extraText?: string
  scraper?: 'screenscraper' | 'igdb'
  scrapeBy?: 'rom' | 'name'
}

const scrapeGameAtom = atom(
  null,
  async (
    get,
    set,
    { gameId, extraText, scraper = 'screenscraper', scrapeBy = 'rom' }: ScrapeSettings
  ) => {
    const ssCreds = get(appConfigAtom).credentials.screenscraper

    const game = get(mainAtoms.single(gameId))
    if (!game) throw new Error(`Tried to scrape undefined game: ${gameId}`)

    const system = get(systemMainAtoms.single(game.system))
    if (!system) throw new Error(`Tried to scrape game for undefined system: ${game.system}`)

    const notificationId = `scrape-${game.id}`

    set(notifications.add, {
      id: notificationId,
      text: `Scraping ${game.name}!${extraText ?? ''}`,
      type: 'download',
      timeout: 0
    })

    const ss = new ScreenScraper({ userId: ssCreds.username, userPassword: ssCreds.password })

    try {
      let scrapedGame: Game
      switch (scraper) {
        case 'screenscraper':
          scrapedGame =
            scrapeBy === 'rom'
              ? await ss.scrapeByRomInfo(game, system)
              : await ss.scrapeByName(game, system)
          break
        case 'igdb':
          const igdb = await IGDB.build()
          scrapedGame = await igdb.scrape(game, system)
      }

      set(mainAtoms.single(gameId), scrapedGame)
      set(notifications.remove, notificationId)
      set(notifications.add, {
        id: `${notificationId}-done`,
        text: `Done scraping ${game.name}!`,
        type: 'success'
      })
    } catch (e) {
      const err = e as { crc: string; size: string }

      if (err.crc && err.size) {
        set(mainAtoms.single(gameId), {
          crc: err.crc,
          romsize: err.size
        })
      }

      set(notifications.remove, notificationId)
      set(notifications.add, {
        id: `${notificationId}-error`,
        text: `Failed to scrape ${game.name}`,
        type: 'error'
      })
    }
  }
)

type ScrapeAllGamesSettings = {
  excludeNotMissing: boolean
} & Omit<ScrapeSettings, 'gameId' | 'extraText'>

const scrapeAllGamesAtom = atom(null, async (get, set, settings: ScrapeAllGamesSettings) => {
  const { excludeNotMissing, ...scrapeSettings } = settings

  let gamesList = get(mainAtoms.lists.all)
  if (excludeNotMissing) {
    gamesList = gamesList.filter((game) => !game.hero && !game.screenshot && !game.logo)
  }

  for (const [index, game] of gamesList.entries()) {
    await set(scrapeGameAtom, {
      gameId: game.id,
      extraText: ` (${index + 1} / ${gamesList.length})`,
      ...scrapeSettings
    })
  }
})

type ByAttributeProp = {
  attribute: keyof Game
  value?: string
  limit?: number
  excludeId?: string | string[]
  shuffle?: boolean
}

const byAttributeAtom = atomFamily(
  (config: ByAttributeProp) =>
    atom((get) => {
      if (!config.value) return []
      const games = get(mainAtoms.lists.all)
      const byAttribute = games.filter((game) => {
        if(game[config.attribute] !== config.value) return false

        if(!config.excludeId) return true
        if(typeof config.excludeId === "string") return game.id !== config.excludeId
        return !config.excludeId.includes(game.id)
      })

      if (!config.limit) return byAttribute

      const shuffled = config.shuffle ? byAttribute.toSorted(() => 0.5 - Math.random()) : byAttribute
      return shuffled.slice(0, config.limit)
    }),
  deepEqual
)

const removeAtom = atom(null, (get, set, id: string) => {
  const game = get(mainAtoms.single(id))
  if (!game) return

  window.removeGameFiles(game)
  set(mainAtoms.remove, id)
})

const searchAtom = atom((get) => {
  const allGames = get(mainAtoms.lists.all)

  const haystack = allGames.map((game) => game.name ?? game.romname)
  const searcher = new uFuzzy()

  return (query: string) => {
    if (!query) return []

    const [indices, _info, order] = searcher.search(haystack, query)
    if (!order || !indices) return []

    return order.map((index) => {
      const gameIndex = indices[index]
      return allGames[gameIndex]
    })
  }
})

export default {
  ...mainAtoms,
  lists: {
    ...mainAtoms.lists,
    recentlyViewed: recentlyViewedAtom,
    recentlyPlayed: recentlyPlayedAtom,
    recentlyAdded: recentlyAddedAtom,
    system: forSystemAtom,
    byAttribute: byAttributeAtom,
    search: searchAtom,
    recommended: recommendedAtom
  },
  launch: launchGameAtom,
  scan: scanGamesAtom,
  download: downloadGameAtom,
  scrape: scrapeGameAtom,
  scrapeAll: scrapeAllGamesAtom,
  remove: removeAtom
}
