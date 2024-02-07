import { Game, MediaTypes, System } from '@common/types'
import { SOFTNAME } from '@renderer/const/const'
import fetchRetry from 'fetch-retry'

const fetch = fetchRetry(window.fetch, {
  retries: 3,
  retryOn: [429],
  retryDelay: 800
}) // ScreenScraper fails often on 429

type URLParams = Record<string, string | number | undefined>
interface ConstructorProps {
  userId?: string
  userPassword?: string
}

const getDecodedHTMLString = (text: string) =>
  new DOMParser().parseFromString(text, 'text/html').body.innerText

export class ScreenScraper {
  private devid = import.meta.env.RENDERER_VITE_SCREENSCRAPER_DEVID
  private devpassword = import.meta.env.RENDERER_VITE_SCREENSCRAPER_DEVPASSWORD
  private baseUrl = 'https://api.screenscraper.fr/api2/'

  private url: URL

  private addParamsToUrl(params: Record<string, string | number | undefined>, url: URL) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, String(value))
    })
  }

  constructor({ userId, userPassword }: ConstructorProps = {}) {
    this.url = new URL(this.baseUrl)
    const params = {
      devid: this.devid,
      devpassword: this.devpassword,
      softname: SOFTNAME,
      output: 'json',
      ssid: userId || undefined,
      sspassword: userPassword || undefined
    }

    this.addParamsToUrl(params, this.url)
  }

  private async fetchWithParams(path: string, params: URLParams) {
    const url = new URL(this.url.href)
    url.pathname += path
    this.addParamsToUrl(params, url)

    const res = await (await fetch(url)).json()
    return res.response
  }

  private async saveScrapeResponseToGame(gameResponse: any, game: Game) {
    const getArt = (
      ssMediaType: string | string[],
      ehMediaType: keyof MediaTypes,
      region: string
    ) => {
      const ssMediaTypes = typeof ssMediaType === 'string' ? [ssMediaType] : ssMediaType

      const entriesOfType = gameResponse.medias.filter((media) => ssMediaTypes.includes(media.type))
      const artEntry =
        entriesOfType.find((entry) => !entry.region || ['wor', region].includes(entry.region)) ??
        entriesOfType[0]

      return {
        mediaType: ehMediaType,
        url: artEntry?.url,
        format: artEntry?.format
      }
    }

    const getByLanguage = (lang: string, entryArray: { langue: string; text: string }[]) => {
      const entry = entryArray.find((entry) => entry.langue === lang) ?? entryArray[0]
      return entry?.text
    }

    const getByRegion = (region: string, entryArray: { region: string; text: string }[]) => {
      const entry =
        entryArray.find((entry) => ['wor', region].includes(entry.region)) ?? entryArray[0]
      return entry?.text
    }

    const medias = [
      getArt('fanart', 'hero', 'us'),
      getArt('steamgrid', 'poster', 'us'),
      getArt(['wheel', 'wheel-hd'], 'logo', 'us'),
      getArt('ss', 'screenshot', 'us')
    ].filter((media) => media.url && media.format)

    const gameWithMedias = await window.downloadGameMedia(game, medias)

    return {
      ...gameWithMedias,
      description: getDecodedHTMLString(getByLanguage('en', gameResponse.synopsis ?? [])),
      players: gameResponse.joueurs?.text,
      name: getByRegion('us', gameResponse.noms),
      genre: getByLanguage('en', gameResponse.genres?.[0]?.noms ?? []),
      publisher: gameResponse.editeur?.text,
      developer: gameResponse.developpeur?.text
    }
  }

  async scrapeByRomInfo(game: Game, system: System): Promise<Game> {
    const path = 'jeuInfos.php'

    const { crc, size } = game.romsize
      ? { crc: game.crc, size: game.romsize }
      : await window.getRomFileInfo(game)

    const params = { romnom: game.romname, systemeid: system.ssId, crc, size }

    try {
      const response = await this.fetchWithParams(path, params)
      const gameWithMetadata = await this.saveScrapeResponseToGame(response.jeu, game)

      return {
        ...gameWithMetadata,
        crc,
        romsize: size
      }
    } catch (e) {
      // if we failed to scrape, at least save crc & romsize so we don't have to recalculate these
      throw { size, crc, err: e }
    }
  }

  async scrapeByName(game: Game, system: System): Promise<Game> {
    const path = 'jeuRecherche.php'
    const params = { systemeid: system.ssId, recherche: game.name }

    try {
      const response = await this.fetchWithParams(path, params)
      const gameResponse = response.jeux?.[0]

      if (!gameResponse) throw 'Game not found!'
      return await this.saveScrapeResponseToGame(gameResponse, game)
    } catch (e) {
      throw { err: e }
    }
  }
}
