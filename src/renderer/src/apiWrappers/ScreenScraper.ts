import { Game, MediaTypes } from "@common/types";
import { SOFTNAME } from "@renderer/const/const";
import fetchRetry from "fetch-retry";

const fetch = fetchRetry(window.fetch, {
  retries: 3,
  retryOn: [429],
  retryDelay: 800
}) // ScreenScraper fails often on 429

type URLParams = Record<string, string | undefined>
interface ConstructorProps {
  userId?: string;
  userPassword?: string;
}

export class ScreenScraper {
  private devid = import.meta.env.RENDERER_VITE_SCREENSCRAPER_DEVID;
  private devpassword = import.meta.env.RENDERER_VITE_SCREENSCRAPER_DEVPASSWORD;
  private baseUrl = "https://api.screenscraper.fr/api2/";

  private url: URL;

  private addParamsToUrl(params: Record<string, string | undefined>, url: URL) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, String(value));
    })
  }

  private async fetchWithParams(path: string, params: URLParams) {
    const url = new URL(this.url.href);
    url.pathname += path;
    this.addParamsToUrl(params, url)

    const res = await (await fetch(url)).json();
    return res.response;
  }

  constructor({ userId, userPassword }: ConstructorProps = {}) {
    this.url = new URL(this.baseUrl)
    const params = {
      devid: this.devid,
      devpassword: this.devpassword,
      softname: SOFTNAME,
      output: "json",
      ssid: userId || undefined,
      sspassword: userPassword || undefined
    }

    this.addParamsToUrl(params, this.url);
  }

  async scrapeByRomInfo(game: Game): Promise<Game> {
    const path = "jeuInfos.php";

    const getArt = (ssMediaType: string | string[], ehMediaType: keyof MediaTypes, region: string, response: any) => {
      const ssMediaTypes = typeof ssMediaType === "string" ? [ssMediaType] : ssMediaType;

      const entriesOfType = response.jeu.medias.filter(media => ssMediaTypes.includes(media.type));
      const artEntry = entriesOfType.find(entry => !entry.region || ["wor", region].includes(entry.region)) ?? entriesOfType[0];

      return {
        mediaType: ehMediaType,
        url: artEntry?.url,
        format: artEntry?.format
      }
    }

    const getByLanguage = (lang: string, entryArray: { langue: string, text: string }[]) => {
      const entry = entryArray.find(entry => entry.langue === lang) ?? entryArray[0];
      return entry?.text;
    }

    const getByRegion = (region: string, entryArray: { region: string, text: string }[]) => {
      const entry = entryArray.find(entry => ["wor", region].includes(entry.region)) ?? entryArray[0];
      return entry?.text;
    }

    const { crc, size } = (game.crc && game.romsize)
      ? { crc: game.crc, size: game.romsize }
      : await window.getRomFileInfo(game);

    const params = { romnom: game.romname, crc, size };

    try {
      const response = await this.fetchWithParams(path, params);

      const medias = [
        getArt("fanart", "hero", "us", response),
        getArt("steamgrid", "poster", "us", response),
        getArt(["wheel", "wheel-hd"], "logo", "us", response),
        getArt("ss", "screenshot", "us", response)
      ].filter(media => media.url && media.format)

      const gameWithMedias = await window.downloadGameMedia(game, medias)
      return {
        ...gameWithMedias,
        description: getByLanguage("en", response.jeu?.synopsis ?? []),
        players: response.jeu.joueurs?.text,
        name: getByRegion("us", response.jeu?.noms),
        genre: getByLanguage("en", response.jeu.genres?.[0]?.noms ?? []),
        publisher: response.jeu.editeur?.text,
        developer: response.jeu.developpeur?.text,
        crc,
        romsize: size
      };
    } catch(e) {
      // if we failed to scrape, at least save crc & romsize so we don't have to recalculate these
      throw({ size, crc, err: e })
    }
  }
}
