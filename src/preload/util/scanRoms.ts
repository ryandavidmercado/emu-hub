import { Game, System } from "@common/types";
import path from "path";
import ShortUniqueId from "short-unique-id";
import { MainPaths } from "@common/types/Paths";
import { readdir, stat } from "fs/promises";

const uid = new ShortUniqueId();

const systemExtnameMap: Record<string, Set<string>> = {}

const scanRoms = async (
  paths: MainPaths,
  currentSystems: System[],
  currentGames: Game[]
) => {
  const getGameLookupKey = (romname: string, systemId: string, rompath: string[] = []) => `${romname}-${systemId}-${rompath.join("_")}`
  const gameLookupMap: Record<string, Game> = currentGames.reduce((acc, game) => {
    const key = getGameLookupKey(game.romname, game.system, game.rompath);
    acc[key] = game;
    return acc;
  }, {})

  const { ROMs: ROM_PATH } = paths;

  const addedDate = new Date().toUTCString();
  const newGames: Game[] = [];
  const romsDir = await readdir(ROM_PATH);

  // remove leading periods, make lowercase
  const normalizeExtname = (extname: string) => {
    const leadingPeriodRemoved = extname.startsWith(".")
      ? extname.slice(1)
      : extname;

    return leadingPeriodRemoved.toLowerCase();
  }

  const scanFolder = async (systemConfig: System, pathTokens: string[] = []) => {
    const systemRomDir = systemConfig.romdir || path.join(ROM_PATH, systemConfig.id);

    const dir = path.join(systemRomDir, ...pathTokens);
    let contents: string[];

    try {
      contents = await readdir(dir);
    } catch(e) {
      console.error(`Failed to read ${systemConfig.name} directory at "${dir}"`);
      return;
    }

    // handle multi-part games by filtering out other tracks/discs
    contents = contents.filter(entry => !entry.match(/\((Track|Disc) [^1]\)/));
    if(!contents.length) return;
    if(contents.includes('.eh-ignore')) return;

    const extnames = systemExtnameMap[systemConfig.id] || (() => {
      const extnames = new Set(systemConfig.fileExtensions.map(normalizeExtname))
      systemExtnameMap[systemConfig.id] = extnames;
      return extnames;
    })()

    for (const entry of contents) {
      const entryPath = path.join(dir, entry);
      const entryExt = path.extname(entry);
      const entryStat = await stat(entryPath);

      if (entryStat.isDirectory()) {
        await scanFolder(systemConfig, [...pathTokens, entry]);
        continue;
      }

      if (!extnames.has(normalizeExtname(entryExt))) continue;

      const lookupKey = getGameLookupKey(entry, systemConfig.id, pathTokens);
      const gameConfigEntry = gameLookupMap[lookupKey];

      if(gameConfigEntry) {
        newGames.push(gameConfigEntry);
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

  const scanQueue: Promise<void>[] = [];
  for (const system of romsDir) {
    const systemConfig = currentSystems.find(config => config.id === system);
    if (!systemConfig) continue;

    scanQueue.push(scanFolder(systemConfig))
  }

  await Promise.allSettled(scanQueue);
  return newGames;
}

export default scanRoms;
