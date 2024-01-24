import { MediaTypes, Game } from "@common/types/Game"

export type SystemStore = {
  id: string
  name: string
} & ({
  type: "html"
  url: string
  selector: string
} | ({
  type: "emudeck"
}))

export interface StoreEntry {
  href: string,
  name: string,
  description?: string,
  genre?: string,
  media?: Record<keyof MediaTypes, {
    url: string,
    format: string
  }>
}

export interface System {
  id: string,
  name: string,
  fileExtensions: string[]
  releaseYear: string;
  company: string;
  handheld?: boolean;
  ssId?: string,
  emulators?: string[]
  stores?: SystemStore[]
}

export type SystemWithGames = System & { games: Game[], screenshot?: string }
