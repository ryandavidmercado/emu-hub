import { Emulator } from "@common/types";
import os from "os";
import { readdir, stat, readFile } from "fs/promises";
import path from "path";
import { FLATPAK_PATHS, LINUX_APPLICATION_PATHS, SNAP_PATHS } from "./const";
import { loadConfig } from "./configStorage";
import { MainPaths } from "@common/types/Paths";
import { existsSync, statSync } from "fs";

const platform = os.platform();

const findRaPath = async (): Promise<string> => {
  const { RetroArch: RA_PATHS } = loadConfig("paths", {}) as MainPaths | { RetroArch: undefined };

  const raEmulatorEntry = {
    name: "RetroArch",
    id: "retroarch",
    location: {
      linux: {
        flatpak: "org.libretro.RetroArch",
        appImage: "RetroArch"
      },
      darwin: {
        name: "RetroArch"
      }
    }
  } as Emulator

  return RA_PATHS?.bin ?? await findEmulator(raEmulatorEntry);
}

const findEmulator = async (emulator: Emulator): Promise<string> => {
  if ("bin" in emulator.location) return emulator.location.bin;
  if ("core" in emulator.location) {
    const raPath = await findRaPath();

    return `${raPath} -L ${emulator.location.core}`;
  }

  switch (platform) {
    case "darwin": {
      return await findDarwinEmulator(emulator)
    }
    case "linux": {
      return await findLinuxEmulator(emulator)
    }
  }

  throw {
    type: "os-not-compat",
    data: platform
  }
}

async function findDarwinEmulator(emulator: Emulator) {
  if (!("darwin" in emulator.location) || !emulator.location.darwin) {
    throw {
      type: "emu-os-compat",
      data: emulator.name
    }
  }

  const appDir = await readdir('/Applications');
  const matcher = new RegExp(`^${escapeRegExp(emulator.location.darwin.name)}.*\.app$`)

  const emuDir = appDir.find(app => app.match(matcher));
  if (!emuDir) throw {
    type: 'emu-not-found',
    data: emulator.name
  }

  const emuMacOSDir = path.join("/", "Applications", emuDir, "Contents", "MacOS");
  const binName = (await readdir(emuMacOSDir))?.[0];

  if (!binName) throw {
    type: 'emu-not-found',
    data: emulator.name
  }

  return path.join(emuMacOSDir, binName)
}

async function findLinuxEmulator(emulator: Emulator) {
  if (!("linux" in emulator.location) || !emulator.location.linux) {
    throw {
      type: "emu-os-compat",
      data: emulator.name
    }
  }

  if (emulator.location.linux.appImage) {
    const matcher = new RegExp(`^${escapeRegExp(emulator.location.linux.appImage)}.*\.AppImage$`)

    for (const applicationPath of LINUX_APPLICATION_PATHS) {
      let dirContents: string[];
      try {
        dirContents = await readdir(applicationPath)
      } catch { continue }

      for (const entry of dirContents) {
        const entryPath = path.join(applicationPath, entry);
        const entryStat = await stat(entryPath);

        if (!entryStat.isDirectory() && entry.match(matcher)) {
          return path.join(applicationPath, entry);
        }
      }
    }
  }

  if (emulator.location.linux.binName) {
    const matcher = new RegExp(`^${escapeRegExp(emulator.location.linux.binName)}$`)

    for (const applicationPath of LINUX_APPLICATION_PATHS) {
      let dirContents: string[];
      try {
        dirContents = await readdir(applicationPath)
      } catch { continue }

      for (const entry of dirContents) {
        const entryPath = path.join(applicationPath, entry);
        const entryStat = await stat(entryPath);

        if (!entryStat.isDirectory()) {
          if (entry.match(matcher)) return path.join(applicationPath, entry);
        } else {
          // we can scan for binNames one layer deep; don't go deeper to keep this quick
          const entryContents = await readdir(entryPath);
          const match = entryContents.find(entryContent =>
            entryContent.match(matcher)
            && !statSync(path.join(entryPath, entryContent)).isDirectory()
          );

          if (match) return path.join(entryPath, match)
        }
      }
    }
  }

  if (emulator.location.linux.flatpak) {
    const matcher = new RegExp(`^${escapeRegExp(emulator.location.linux.flatpak)}(?:\.desktop){0,1}$`)

    for (const flatpakPath of FLATPAK_PATHS) {
      let dirContents: string[];
      try {
        dirContents = await readdir(flatpakPath)
      } catch { continue }

      const match = dirContents.find(entry => entry.match(matcher));
      if (!match) continue;

      // super simple .desktop parse; we just use the exec string
      if (path.extname(match) === ".desktop") {
        const execMatcher = /^Exec=(.*)$/m;
        const filePath = path.join(flatpakPath, match);

        try {
          const file = await readFile(filePath, { encoding: "utf8" });
          const execString = file.match(execMatcher)?.[1]
          if (!execString) continue;

          return execString;
        } catch { continue }
      }

      return path.join(flatpakPath, match)
    }
  }

  if (emulator.location.linux.snap) {
    for (const snapPath of SNAP_PATHS) {
      const emuPath = path.join(snapPath, emulator.location.linux.snap)

      if (!existsSync(emuPath)) continue
      return emuPath;
    }
  }

  throw {
    type: 'emu-not-found',
    data: emulator.name
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
} // https://stackoverflow.com/a/6969486

export default findEmulator
