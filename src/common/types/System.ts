import { MediaTypes, Game } from "@common/types/Game"
import { NameMapper } from "./NameMapper";

export type SystemStore = {
  id: string;
  name: string;
} & ({
  type: "html";
  url: string;
  selector: string;
} | ({
  type: "emudeck";
}))

export interface StoreEntry {
  href: string;
  name: string;
  description?: string;
  genre?: string;
  media?: Record<keyof MediaTypes, {
    url: string;
    format: string;
  }>
}

export interface System {
  id: string;
  name: string;
  fileExtensions: string[];
  releaseYear: string;
  company: string;
  handheld?: boolean;
  ssId?: number;
  igdbId?: number;
  emulators?: string[];
  stores?: SystemStore[];
  logo?: string;
  romdir?: string;
  defaultNames?: {
    [ext: string]: {
      type: "pathToken",
      token: number,
      map?: NameMapper
    }
  }
}

export type SystemWithGames = System & { games: Game[], screenshot?: string }
