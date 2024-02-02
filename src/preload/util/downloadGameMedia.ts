import path from "path";
import { Game } from "@common/types";
import { ASSETS_PATH } from "./const";
import { mkdir, writeFile } from "fs/promises";

interface GameMedia {
  mediaType: string,
  url: string,
  format: string
}

const downloadGameMedia = async (game: Game, medias: GameMedia[]) => {
  const gameAssetsPath = path.join(ASSETS_PATH, 'games', game.system, ...(game.rompath || []), `${game.romname}`);

  try {
    await mkdir(gameAssetsPath, { recursive: true })
  } catch {}

  const requests = medias.map(({ mediaType, url, format }) => async () => {
    const mediaPath = path.join(gameAssetsPath, `${mediaType}.${format}`)

    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    await writeFile(mediaPath, buffer);
    return {
      mediaType,
      mediaPath
    }
  });

  const fulfilled = await Promise.allSettled(requests.map(req => req()));
  const newGame = fulfilled.reduce((acc, fulfilledEntry) => {
    if(fulfilledEntry.status === "rejected") return acc;
    const { mediaType, mediaPath } = fulfilledEntry.value;

    return {
      ...acc,
      [mediaType]: mediaPath,
    }
  }, game)

  newGame.gameTileDisplayType =
    newGame.hero
      ? "fanart"
      : newGame.screenshot
        ? "screenshot"
        : undefined

  return newGame;
}

export default downloadGameMedia
