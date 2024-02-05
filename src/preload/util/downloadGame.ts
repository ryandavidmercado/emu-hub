import download from "download";

import { Game, System } from "@common/types";

import path from "path";
import ShortUniqueId from "short-unique-id";
import { createReadStream } from "fs";
import { readdir, rm, rmdir, rename } from "fs/promises"
import unzipper from "unzipper";
import { MainPaths } from "@common/types/Paths";

const uid = new ShortUniqueId();

const downloadGame = async (system: System, url: string, paths: MainPaths) => {
  const systemPath = system.romdir || path.join(paths.ROMs, system.id)

  const romname = decodeURIComponent(path.basename(url));
  const name = path.basename(romname, path.extname(romname)).replace(/\([^\)]*\)/g, "").trim();

  const id = uid.rnd();

  await download(url, systemPath, { filename: romname });

  // if we don't need to unzip, return early
  if(path.extname(romname) !== ".zip" || system.fileExtensions.includes(".zip")) {
    return {
      romname,
      name,
      id,
      system: system.id,
      added: new Date().toUTCString()
    } as Game
  }

  // zip files don't scrape particularly well; unzip them
  const zipFilePath = path.join(systemPath, romname);
  const outputPath = path.join(systemPath, name);

  await new Promise<void>((resolve, reject) => {
    createReadStream(zipFilePath)
      .pipe(unzipper.Extract({
        path: outputPath
      }))
      .on('close', () => { resolve() })
      .on('error', (e) => { reject(e)})
  })

  const unzippedDir = await readdir(outputPath);
  const gameFile = unzippedDir.find(file => {
    const extname = path.extname(file);
    return system.fileExtensions.includes(extname)
      && !file.match(/\((Track|Disc) [^1]\)/) // handle multi-part games by filtering out other tracks/discs
  })

  if(!gameFile) throw "No valid ROM found in downloaded zip file!";

  await rm(zipFilePath)

  let rompath: string[] | undefined = [name]; // path for romfile relative to system dir

  // if we only have one file, let's take it out of the subdir
  if(unzippedDir.length === 1) {
    const inSubDir = path.join(outputPath, gameFile);
    const inSystemDir = path.join(systemPath, gameFile);

    await rename(inSubDir, inSystemDir)
    await rmdir(outputPath);

    rompath = undefined; // we no longer have a nested path to deal with
  }

  return {
    romname: gameFile,
    rompath,
    name: path.basename(gameFile, path.extname(gameFile)).replace(/\([^\)]*\)/g, "").trim(),
    id,
    system: system.id,
    added: new Date().toUTCString()
  } as Game
}

export default downloadGame;
