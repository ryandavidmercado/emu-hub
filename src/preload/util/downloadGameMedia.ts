import path from 'path'
import { Game } from '@common/types'
import { ASSETS_PATH } from './const'
import { mkdir, writeFile } from 'fs/promises'
import sharp from 'sharp'
import { refreshImages } from './loadMedia'

interface GameMedia {
  mediaType: string
  url: string
  format: string
}

const downloadGameMedia = async (
  game: Game,
  medias: GameMedia[],
  headers?: Record<string, string>
) => {
  const gameAssetsPath = path.join(
    ASSETS_PATH,
    'games',
    game.system,
    ...(game.rompath || []),
    `${game.romname}`
  )

  try {
    await mkdir(gameAssetsPath, { recursive: true })
  } catch { }

  const requests = medias.map(({ mediaType, url, format }) => async () => {
    const mediaPath = path.join(gameAssetsPath, `${mediaType}.${format}`)

    const response = await fetch(url, { headers })
    if (response.status === 404) throw 'Image not found'

    let buffer = Buffer.from(await response.arrayBuffer())
    try {
      // screenscraper assets often come with padding that leads to layout inconsistency
      // get rid of it!
      buffer = await sharp(buffer).trim().toBuffer()
    } catch (e) {
      console.log(`Couldn't crop asset ${mediaType} for ${game.romname} -- ${e}`)
    }

    await writeFile(mediaPath, buffer)
    return {
      mediaType,
      mediaPath
    }
  })

  const fulfilled = await Promise.allSettled(requests.map((req) => req()))
  const newGame = fulfilled.reduce((acc, fulfilledEntry) => {
    if (fulfilledEntry.status === 'rejected') return acc
    const { mediaType, mediaPath } = fulfilledEntry.value

    return {
      ...acc,
      [mediaType]: mediaPath
    }
  }, game)

  if (!newGame.gameTileDisplayType) {
    newGame.gameTileDisplayType = newGame.hero
      ? 'fanart'
      : newGame.screenshot
        ? 'screenshot'
        : undefined
  }

  refreshImages()
  return newGame
}

export default downloadGameMedia
