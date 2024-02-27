import { Game, GameMedia, System } from '@common/types'

export class IGDB {
  private accessToken: string
  static clientId = import.meta.env.RENDERER_VITE_IGDB_CLIENT_ID
  static clientSecret = import.meta.env.RENDERER_VITE_IGDB_CLIENT_SECRET

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  static async build() {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: IGDB.clientId,
      client_secret: IGDB.clientSecret
    })

    const authRes = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
      method: 'POST'
    })

    const { access_token } = await authRes.json()
    return new IGDB(access_token)
  }

  async scrape(game: Game, system: System, query?: string ): Promise<Game> {
    const systemQuery = system.igdbId ? ` & release_dates.platform = (${system.igdbId})` : ''

    const gameQuery = `
      search "${query ?? game.name}";
      fields name, screenshots.image_id, artworks.image_id, genres.name, summary, involved_companies.*, involved_companies.company.name;
      where category=0${systemQuery};
      limit 1;
    `

    const authHeaders = {
      'Client-ID': IGDB.clientId,
      Authorization: `Bearer ${this.accessToken}`
    }

    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...authHeaders
      },
      body: gameQuery
    })

    const data = await res.json()
    const buildImageMediaReq = (id: string, mediaType: string): GameMedia | null =>
      id
        ? {
            url: `https://images.igdb.com/igdb/image/upload/t_1080p/${id}.jpg`,
            format: 'jpg',
            mediaType
          }
        : null

    const gameResponse = data[0]
    const medias: GameMedia[] = [
      buildImageMediaReq(gameResponse.screenshots?.[0]?.['image_id'], 'screenshot'),
      buildImageMediaReq(gameResponse.artworks?.[0]?.['image_id'], 'hero')
    ].filter((media): media is GameMedia => Boolean(media))

    const gameWithMedia = await window.downloadGameMedia(game, medias, authHeaders)
    const metadata = [
      {
        key: 'developer',
        value: gameResponse.involved_companies?.find((company) => company.developer)?.company?.name
      },
      {
        key: 'publisher',
        value: gameResponse.involved_companies?.find((company) => company.publisher)?.company?.name
      },
      { key: 'description', value: gameResponse.summary },
      { key: 'genre', vaolue: gameResponse.genres?.[0]?.name }
    ]
      .filter((m) => m.value)
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

    return {
      ...gameWithMedia,
      ...metadata
    }
  }
}
