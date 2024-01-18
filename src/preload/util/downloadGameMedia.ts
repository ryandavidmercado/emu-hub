import path from "path";
import { Game, MediaTypes } from "../types/Game";
import { ASSETS_PATH } from "./const";
import { mkdir, writeFile } from "fs/promises";
import Jimp from "jimp"

interface GameMedia {
  mediaType: keyof MediaTypes,
  url: string,
  format: string
}

const downloadGameMedia = async (game: Game, medias: GameMedia[]) => {
  const gameAssetsPath = path.join(ASSETS_PATH, `${game.id} - ${game.name}`);

  try {
    await mkdir(gameAssetsPath)
  } catch {}

  const requests = medias.map(({ mediaType, url, format }) => async () => {
    const mediaPath = path.join(gameAssetsPath, `${mediaType}.${format}`)

    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    // ScreenScraper logos often have a load of padding which messes with our layouts
    // Try to autocrop before we save
    if(mediaType === "logo") {
      try {
        const jimpHandle = await Jimp.read(buffer)
        await jimpHandle.autocrop()
          .writeAsync(mediaPath);

        return { mediaType, mediaPath}
      } catch {}
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
