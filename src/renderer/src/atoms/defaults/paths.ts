import { MainPaths } from "@common/types/Paths"

const defaultPaths = {
  "RetroArch": {
    "linux": {
      bin: window.path.join(window.homedir, ".local", "share", "flatpak", "exports", "bin", "org.libretro.RetroArch"),
      cores: window.path.join(window.homedir, ".var", "app", "org.libretro.RetroArch", "config", "retroarch", "cores"),
      coreExtension: 'so'
    },
    "darwin": {
      bin: window.path.join("/", "Applications", "RetroArch.app", "Contents", "MacOS", "RetroArch"),
      cores: window.path.join(window.homedir, "Library", "Application Support", "RetroArch", "cores"),
      coreExtension: 'dylib'
    }
  },
  "ROMs": window.path.join(window.homedir, "Documents", "EmuHub", "roms")
}

const parsedPaths: MainPaths = {
  "RetroArch": defaultPaths.RetroArch[window.platform],
  "ROMs": defaultPaths.ROMs
}

export default parsedPaths;
