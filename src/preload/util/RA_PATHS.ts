import path from "path";
import os from "os"
import { loadConfig } from "./configStorage"

interface Paths {
  bin: string,
  cores: string
  coreExtension: string
}

const RA_PATHS = {
  darwin: {
    bin: path.join("/", "Applications", "RetroArch.app", "Contents", "MacOS", "RetroArch"),
    cores: path.join(os.homedir(), "Library", "Application Support", "RetroArch", "cores"),
    coreExtension: 'dylib'
  },
  linux: {
    bin: "org.libretro.RetroArch",
    cores: path.join(os.homedir(), ".var", "app", "org.libretro.RetroArch", "config", "retroarch", "cores"),
    coreExtension: 'so'
  }
}

const pathsConfig = loadConfig("paths", {
  RetroArch: {
    bin: "",
    cores: "",
  },
  ROMs: ""
});

const paths = {
  bin: pathsConfig.RetroArch?.bin || RA_PATHS[process.platform as keyof typeof RA_PATHS].bin,
  cores: pathsConfig.RetroArch?.cores || RA_PATHS[process.platform as keyof typeof RA_PATHS].cores,
  coreExtension: RA_PATHS[process.platform as keyof typeof RA_PATHS].coreExtension
}

export default paths as Paths;
