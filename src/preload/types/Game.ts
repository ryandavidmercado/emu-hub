export interface Game {
  id: string,
  players?: number,
  name?: string,
  poster?: string,
  hero?: string,
  logo?: string,
  description?: string,
  system: string
  lastPlayed?: string
  romname: string
  rompath?: string[]
  timesPlayed?: number
}
