import path from 'path'
import { Game } from '@common/types'
import { rmSync } from 'fs'
import { loadConfig } from './configStorage'
import { AppConfig } from '@common/types'

const removeGameFiles = (game: Game) => {
  const { paths: { roms: configRomPath }} = loadConfig(
    'config',
    {} /* we don't need to supply a default; jotai initializes this config on boot */
  ) as AppConfig 

  const romPath = path.join(configRomPath, game.system, ...(game.rompath ?? []), game.romname)
  const mediaPaths = [game.hero, game.screenshot, game.poster].filter(Boolean) as string[]

  rmSync(romPath, { recursive: true })
  for (const mediaPath of mediaPaths) {
    rmSync(mediaPath)
  }
}

export default removeGameFiles
