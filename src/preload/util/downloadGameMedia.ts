import path from "path";
import { Game } from "@common/types";
import { ASSETS_PATH } from "./const";
import { mkdir, writeFile } from "fs/promises";
import Jimp from "jimp";

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

    let buffer = Buffer.from(await response.arrayBuffer());
    try {
      buffer = await Jimp.read(buffer)
        .then(img =>
          img
            .autocrop()
            .getBufferAsync(Jimp.AUTO as unknown as string)
        )
    } catch(e) {
      console.log(`Couldn't crop asset ${mediaType} for ${game.romname} -- ${e}`)
    }

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
      [mediaType]: mediaPath
    }
  }, game)

  return newGame;
}

export default downloadGameMedia
