import path from "path";
import { Game, Emulator } from "@common/types";
import { FLATPAK_PATH } from "./const";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { loadConfig } from "./configStorage";
import { MainPaths } from "@common/types/Paths";

const exec = promisify(execCb);

const launchGame = (game: Game, emulator: Emulator) => {
  const { RetroArch: RA_PATHS, ROMs: ROM_PATH } = loadConfig("paths", {} /* we don't need to supply a default; jotai initializes this config on boot */) as MainPaths;

  const romLocation = path.join(ROM_PATH, game.system, ...(game.rompath ?? []), game.romname);
  let bin: string;
  let args: string[];

  if("core" in emulator) {
    bin = RA_PATHS.bin;

    args = [
      "-f",
      `-L "${path.join(RA_PATHS.cores, emulator.core)}.${RA_PATHS.coreExtension}"`,
      `"${romLocation}"`
    ]
  } else if("flatpak" in emulator) {
    bin = path.join(FLATPAK_PATH, emulator.flatpak);
    args = [emulator.arg, `"${romLocation}"`].filter(Boolean) as string[];
  } else {
    bin = emulator.bin;
    args = [emulator.arg, `"${romLocation}"`].filter(Boolean) as string[];
  }

  const execString = `${bin} ${args.join(" ")}`
  return exec(execString);
}

export default launchGame;
