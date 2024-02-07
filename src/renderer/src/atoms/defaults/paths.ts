import { MainPaths } from "@common/types/Paths"

const defaultPaths = {
  "ROMs": window.path.join(window.homedir, "Documents", "EmuHub", "roms")
}

const parsedPaths: MainPaths = {
  "ROMs": defaultPaths.ROMs
}

export default parsedPaths;
