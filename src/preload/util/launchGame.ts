import path from "path";
import { Emulator } from "../types/Emulator";
import RA_PATHS from "./RA_PATHS";
import { ROM_PATH } from "./const";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { Game } from "../types/Game";

const exec = promisify(execCb);

const launchGame = (game: Game, emulator: Emulator) => {
  const romLocation = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);
  let bin: string;
  let args: string[];

  if("core" in emulator) {
    bin = RA_PATHS.bin
    args = [
      "-f",
      `-L "${path.join(RA_PATHS.cores, emulator.core)}.dylib"`,
      `"${romLocation}"`
    ]
  } else {
    bin = emulator.bin
    args = [`"${romLocation}"`]
  }

  const execString = `${bin} ${args.join(" ")}`
  return exec(execString);
}

export default launchGame;
