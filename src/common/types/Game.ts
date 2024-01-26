export interface MediaTypes {
  poster?: string
  hero?: string
  logo?: string
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
  lastViewed?: string
  timesPlayed?: number
  developer?: string
  publisher?: string
  genre?: string
  name?: string
  added?: string
  crc?: string
  romsize?: string
  showcaseDisplayType?: "screenshot" | "fanart",
  gamePageDisplayType?: "screenshot" | "fanart",
  gameTileDisplayType?: "screenshot" | "poster"
} & MediaTypes
