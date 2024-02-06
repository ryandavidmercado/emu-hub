import path from "path";
import { Game, Emulator, System } from "@common/types";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { loadConfig } from "./configStorage";
import { MainPaths } from "@common/types/Paths";
import { readFileSync } from "fs";
import findEmulator from "./findEmulator";

const exec = promisify(execCb);

const parseLaunchCommand = (command: string, emulatorLocation: string, romLocation: string) => {
  const templateMap = {
    /*  NOTE: Emulator path for RetroArch cores pre-includes the core launch command
        ex: /path/to/RetroArch.AppImage -L /path/to/ra-cores/relevant_core.dylib */
    "%EMUPATH%": () => emulatorLocation, // ex: /home/Applications/CoolEmu.AppImage
    "%ROMPATH%": () => romLocation, // ex: /path/to/roms/someSystem/someParentDir/myRom.rom
    "%ROMDIR%": () => path.dirname(romLocation), // ex: /path/to/roms/someSystem/someParentDir
    "%ROMDIRNAME%": () => path.basename(path.dirname(romLocation)), // ex: someParentDir
    "%ROMNAME%": () => path.parse(romLocation).base, // ex: myRom.rom
    "%ROMNAMENOEXT%": () => path.parse(romLocation).name, // ex: myRom
    "%ROMEXT%": () => path.parse(romLocation).ext, // .rom
    "%ROMTEXTCONTENT%": () => readFileSync(romLocation, { encoding: "utf8" }), // ex: rom is text file with contents "Hello" -> this returns "Hello"
  } as const

  return Object.keys(templateMap).reduce((command, templateKey) => {
    if(!command.includes(templateKey)) return command;
    return command.replaceAll(templateKey, templateMap[templateKey]())
  }, command);
}

const launchGame = async (game: Game, emulator: Emulator, system: System) => {
  const bin = await findEmulator(emulator);
  const { ROMs: ROM_PATH } = loadConfig("paths", {} /* we don't need to supply a default; jotai initializes this config on boot */) as MainPaths;

  const systemDir = system.romdir ?? path.join(ROM_PATH, system.id);
  const romLocation = path.join(systemDir, ...(game.rompath ?? []), game.romname);

  let args: string[];

  if("core" in emulator.location) {
    args = [
      `"${romLocation}"`,
      "-f"
    ]
  } else if("flatpak" in emulator) {
    args = [emulator.arg, `"${romLocation}"`].filter(Boolean) as string[];
  } else {
    args = [emulator.arg, `"${romLocation}"`].filter(Boolean) as string[];
  }

  const launchCommand = emulator.launchCommands?.[path.extname(game.romname)] ?? emulator.launchCommand;

  const execString = launchCommand
    ? parseLaunchCommand(launchCommand, bin, romLocation)
    : `${bin} ${args.join(" ")}`

  console.log(`Launching ${game.name ?? game.romname} with command: ${execString}`);
  return exec(execString);
}

export default launchGame;
