import os from "os";
import path from "path";

const HOME_PATH = os.homedir();

export const EMUHUB_PATH = path.join(HOME_PATH, "Documents", "EmuHub");
export const USER_PATH = path.join(EMUHUB_PATH, "user");
export const CONFIG_PATH = path.join(USER_PATH, "config");
export const ROM_PATH = path.join(USER_PATH, "roms");
