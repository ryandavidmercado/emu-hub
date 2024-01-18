import path from "path";
import { Game } from "../types/Game";
import { ROM_PATH } from "./const";
import crc32 from "crc/crc32";
import { stat } from "fs/promises";
import { createReadStream } from "fs";

/* We read romfile in 10MB chunks while calculating CRC to minimize RAM usage */
const CHUNK_SIZE = 10000000; // 10MB

const getRomFileInfo = async (game: Game) => {
  const romLocation = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);

  const stats = await stat(romLocation);
  const fileStream = createReadStream(romLocation, { highWaterMark: CHUNK_SIZE });

  let crc: number;
  for await(const data of fileStream) {
    crc = crc32(data, crc! ?? undefined);
  }

  return {
    crc: crc!.toString(16),
    size: stats.size
  }
}

export default getRomFileInfo;
