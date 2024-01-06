import path from "path";
import os from "os"

interface Paths {
  bin: string,
  cores: string
}

const RA_PATHS = {
  darwin: {
    bin: path.join("/", "Applications", "RetroArch.app", "Contents", "MacOS", "RetroArch"),
    cores: path.join(os.homedir(), "Library", "Application Support", "RetroArch", "cores")
  }
}

const paths = RA_PATHS[process.platform];
export default paths as Paths;
