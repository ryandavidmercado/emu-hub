import download from "download";
import { System } from "../types/System";
import { ROM_PATH } from "./const";
import path from "path";
import { Game } from "../types/Game";
import ShortUniqueId from "short-unique-id";
import { createReadStream } from "fs";
import { readdir, rm, rmdir, rename } from "fs/promises"
import unzipper from "unzipper";

const uid = new ShortUniqueId();

const downloadGame = async (system: System, url: string) => {
  const systemPath = path.join(ROM_PATH, system.id)
  const romname = path.basename(decodeURI(url))
  const name = path.basename(romname, path.extname(romname))
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
    return system.fileExtensions.includes(extname);
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
    name: path.basename(gameFile, path.extname(gameFile)),
    id,
    system: system.id,
    added: new Date().toUTCString()
  } as Game
}

export default downloadGame;
