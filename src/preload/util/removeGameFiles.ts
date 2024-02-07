import path from 'path'
import { Game } from '@common/types'
import { rmSync } from 'fs'
import { loadConfig } from './configStorage'
import { MainPaths } from '@common/types/Paths'

const removeGameFiles = (game: Game) => {
  const { ROMs: ROM_PATH } = loadConfig(
    'paths',
    {} /* we don't need to supply a default; jotai initializes this config on boot */
  ) as MainPaths

  const romPath = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname)
  const mediaPaths = [game.hero, game.screenshot, game.poster].filter(Boolean) as string[]

  rmSync(romPath, { recursive: true })
  for (const mediaPath of mediaPaths) {
    rmSync(mediaPath)
  }
}

export default removeGameFiles
