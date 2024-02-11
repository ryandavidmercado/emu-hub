import { ColorSchemeId } from "@common/types"

export interface AppConfig {
  ui: {
    grid: {
      columnCount: number
    }
    colorScheme: ColorSchemeId
  }
  paths: {
    RetroArch?: string
    roms: string
  },
  credentials: {
    screenscraper: {
      username: string
      password: string
    }
  }
}
