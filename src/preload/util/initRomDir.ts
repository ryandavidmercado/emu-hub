import { System } from "@common/types";
import { MainPaths } from "@common/types/Paths";
import { mkdir } from "fs/promises";
import path from "path";

const initRomDir = async (paths: MainPaths, systems: System[]) => {
  const { ROMs: ROM_PATH } = paths;

  try {
    await mkdir(ROM_PATH);
  } catch(e) { }

  for(const system of systems) {
    const systemPath = path.join(ROM_PATH, system.id);
    await mkdir(systemPath, { recursive: true })
  }
}

export default initRomDir;
