import { existsSync, mkdirSync } from "fs";
import os from "os";
import path from "path";

const HOME_PATH = os.homedir();

const EMUHUB_PATH = path.join(HOME_PATH, "Documents", "EmuHub");
const CONFIG_PATH = path.join(EMUHUB_PATH, "config");

const ASSETS_PATH = path.join(EMUHUB_PATH, "assets");
const GAME_ASSETS_PATH = path.join(ASSETS_PATH, "games");
const SYSTEM_ASSETS_PATH = path.join(ASSETS_PATH, "systems");

const FLATPAK_PATH = path.join(os.homedir(), ".local", "share", "flatpak", "exports", "bin");
const FLATPAK_PATHS = [
  path.join(os.homedir(), ".local", "share", "flatpak", "exports", "bin"),
  path.join("/", "var", "lib", "flatpak", "exports", "share")
]

const LINUX_APPLICATION_PATHS = [
  path.join(os.homedir(), "Applications")
]

for(const path of [
  EMUHUB_PATH,
  CONFIG_PATH,
  ASSETS_PATH,
  GAME_ASSETS_PATH,
  SYSTEM_ASSETS_PATH
]) {
  if(!existsSync(path)) {
    mkdirSync(path);
  }
}

export {
  EMUHUB_PATH,
  CONFIG_PATH,
  FLATPAK_PATH,
  ASSETS_PATH,
  GAME_ASSETS_PATH,
  SYSTEM_ASSETS_PATH,
  FLATPAK_PATHS,
  LINUX_APPLICATION_PATHS
}
