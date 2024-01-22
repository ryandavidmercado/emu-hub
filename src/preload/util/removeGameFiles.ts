import path from "path";
import { Game } from "@common/types";
import { ROM_PATH } from "./const";
import { rmSync } from "fs";

const removeGameFiles = (game: Game) => {
  const romPath = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);
  rmSync(romPath);
}

export default removeGameFiles;
