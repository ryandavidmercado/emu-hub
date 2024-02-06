import path from "path";
import { Game } from "@common/types";
import crc32 from "crc/crc32";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { loadConfig } from "./configStorage";
import { MainPaths } from "@common/types/Paths";

// we won't calculate crc32 if file size is greater than this; takes too long and slows down UI
const MAX_CRC_SIZE = 25000000; // 25MB

const getRomFileInfo = async (game: Game) => {
  const { ROMs: ROM_PATH } = loadConfig("paths", {} /* we don't need to supply a default; jotai initializes this config on boot */) as MainPaths;
  const romLocation = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);

  const stats = await stat(romLocation);

  // avoid crash when interpreting a folder as a rom file (as with .ps3 directories)
  if(stats.isDirectory()) return { crc: undefined, size: undefined }

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
