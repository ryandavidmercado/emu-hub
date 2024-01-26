import { Game, System } from "@common/types";
import path from "path";
import { isEqual } from "lodash"
import ShortUniqueId from "short-unique-id";
import { MainPaths } from "@common/types/Paths";
import { readdir, stat } from "fs/promises";

const uid = new ShortUniqueId();

const scanRoms = async (
  cleanupMissingGames = false,
  paths: MainPaths,
  currentSystems: System[],
  currentGames: Game[]
) => {
  const { ROMs: ROM_PATH } = paths;

  const addedDate = new Date().toUTCString();
  const newGames: Game[] = [];
  const romsDir = await readdir(ROM_PATH);

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

  const scanFolder = async (systemConfig: System, pathTokens: string[] = []) => {
    const dir = path.join(ROM_PATH, systemConfig.id, ...pathTokens);
    let contents = await readdir(dir);

    // handle multi-part games by filtering out other tracks/discs
    contents = contents.filter(entry => !entry.match(/\((Track|Disc) [^1]\)/));

    for (const entry of contents) {
      const entryPath = path.join(dir, entry);
      const entryExt = path.extname(entry);
      const entryStat = await stat(entryPath);

      if (entryStat.isDirectory()) {
        scanFolder(systemConfig, [...pathTokens, entry]);
        continue;
      }

      if (!systemConfig
        .fileExtensions
        .map(normalizeExtname)
        .includes(normalizeExtname(entryExt))
      ) continue;

      const gameConfigEntry = currentGames.find(game => (
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
        added: addedDate
      })
    }
  }

  for (const system of romsDir) {
    const systemConfig = currentSystems.find(config => config.id === system);
    if (!systemConfig) continue;

    await scanFolder(systemConfig)
  }

  return [...(cleanupMissingGames ? [] : currentGames), ...newGames];
}

export default scanRoms;
