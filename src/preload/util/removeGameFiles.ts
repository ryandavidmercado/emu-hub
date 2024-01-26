import path from "path";
import { Game } from "@common/types";
import { ROM_PATH } from "./const";
import { rmSync } from "fs";

const removeGameFiles = (game: Game) => {
  const romPath = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);
  const mediaPaths = [game.hero, game.screenshot, game.poster].filter(Boolean) as string[];

  rmSync(romPath);
  for(const mediaPath of mediaPaths) {
    rmSync(mediaPath)
  }
}

export default removeGameFiles;
