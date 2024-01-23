import configStorage from "./configStorage"
import { readdirSync, statSync } from "fs";
import { ROM_PATH } from "./const";
import { Game, System } from "@common/types";
import path from "path";
import { isEqual } from "lodash"
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId();

const scanRoms = (cleanupMissingGames = false) => {
  const gamesConfig = configStorage.getItem<Game[]>("games", []);

  const systemsConfig = configStorage.getItem<System[]>("systems", []);
  const newGames: Game[] = [];

  const romsDir = readdirSync(ROM_PATH);

  const compareRomPaths = (fromGame: string[] | undefined, fromScan: string[]) => {
    if (!fromGame || !fromGame?.length) {
      return !fromScan.length
    } else {
      return isEqual(fromGame, fromScan)
    }
  }

  // remove leading periods, make lowercase
  const normalizeExtname = (extname: string) => {
    const leadingPeriodRemoved = extname.startsWith(".")
      ? extname.slice(1)
      : extname;

    return leadingPeriodRemoved.toLowerCase();
  }

  const scanFolder = (systemConfig: System, pathTokens: string[] = []) => {
    const dir = path.join(ROM_PATH, systemConfig.id, ...pathTokens);
    const contents = readdirSync(dir);

    for (const entry of contents) {
      const entryPath = path.join(dir, entry);
      const entryExt = path.extname(entry);
      const stat = statSync(entryPath);

      if (stat.isDirectory()) {
        scanFolder(systemConfig, [...pathTokens, entry]);
        continue;
      }

      if (!systemConfig
        .fileExtensions
        .map(normalizeExtname)
        .includes(normalizeExtname(entryExt))
      ) continue;

      const gameConfigEntry = gamesConfig.find(game => (
        game.romname === entry
        && game.system === systemConfig.id
        && compareRomPaths(game.rompath, pathTokens)
      ))

      if(gameConfigEntry) {
        cleanupMissingGames && newGames.push(gameConfigEntry);
        continue;
      }

      newGames.push({
        id: uid.rnd(),
        rompath: pathTokens.length ? pathTokens : undefined,
        romname: entry,
        system: systemConfig.id,
        name: path.basename(entry, entryExt),
        added: new Date().toUTCString()
      })
    }
  }

  for (const system of romsDir) {
    const systemConfig = systemsConfig.find(config => config.id === system);
    if (!systemConfig) continue;

    scanFolder(systemConfig)
  }

  return [...(cleanupMissingGames ? [] : gamesConfig), ...newGames];
}

export default scanRoms;
