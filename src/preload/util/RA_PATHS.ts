import path from "path";
import os from "os"

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

const paths = RA_PATHS[process.platform];
export default paths as Paths;
