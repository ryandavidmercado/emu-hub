import { existsSync, mkdirSync } from "fs";
import os from "os";
import path from "path";
import defaultPathConfig from "../defaults/pathConfig";
import { loadConfig } from "./configStorage";

const HOME_PATH = os.homedir();

const EMUHUB_PATH = path.join(HOME_PATH, "Documents", "EmuHub");
const CONFIG_PATH = path.join(EMUHUB_PATH, "config");
const ASSETS_PATH = path.join(EMUHUB_PATH, "assets");
const GAME_ASSETS_PATH = path.join(ASSETS_PATH, "games");

const pathsConfig = loadConfig("paths", defaultPathConfig);
const ROM_PATH = pathsConfig.ROMs || path.join(EMUHUB_PATH, "roms");

for(const path of [
  EMUHUB_PATH,
  CONFIG_PATH,
  ROM_PATH,
  ASSETS_PATH,
  GAME_ASSETS_PATH,
]) {
  if(!existsSync(path)) {
    mkdirSync(path);
  }
}

export {
  EMUHUB_PATH,
  CONFIG_PATH,
  ROM_PATH,
  ASSETS_PATH
}
