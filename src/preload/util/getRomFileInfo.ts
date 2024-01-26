import path from "path";
import { Game } from "@common/types";
import { ROM_PATH } from "./const";
import crc32 from "crc/crc32";
import { stat } from "fs/promises";
import { createReadStream } from "fs";

// we won't calculate crc32 if file size is greater than this; takes too long and slows down UI
const MAX_CRC_SIZE = 25000000; // 25MB

const getRomFileInfo = async (game: Game) => {
  const romLocation = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);

  const stats = await stat(romLocation);
  const fileStream = createReadStream(romLocation);

  const size = stats.size
  if(size > MAX_CRC_SIZE) return { size: String(size) }

  let crc: number;
  for await(const data of fileStream) {
    crc = crc32(data, crc! ?? undefined);
  }

  return {
    crc: crc!.toString(16),
    size: String(size)
  }
}

export default getRomFileInfo;
