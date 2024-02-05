import { Emulator } from "@common/types"
import { mergeWith } from "lodash"
import { merger } from "./util/merger"

const defaultEmulators = [
  {
    "id": "mesen_libretro",
    "core": "mesen_libretro",
    "name": "Mesen"
  },
  {
    "id": "nestopia_libretro",
    "core": "nestopia_libretro",
    "name": "Nestopia UE"
  },
  {
    "id": "mupen64plus_next_libretro",
    "name": "Mupen64Plus-Next",
    "platform": {
      "win32": {
        "core": "mupen64plus_next_libretro"
      },
      "linux": {
        "core": "mupen64plus_next_libretro"
      }
    }
  },
  {
    "id": "parallel_n64_libretro",
    "core": "parallel_n64_libretro",
    "name": "ParaLLEl N64"
  },
  {
    "id": "sameboy_libretro",
    "core": "sameboy_libretro",
    "name": "SameBoy"
  },
  {
    "id": "mgba_libretro",
    "core": "mgba_libretro",
    "name": "mGBA"
  },
  {
    "id": "melonds_libretro",
    "core": "melonds_libretro",
    "name": "MelonDS"
  },
  {
    "id": "genesis_plus_gx_libretro",
    "core": "genesis_plus_gx_libretro",
    "name": "Genesis Plus GX"
  },
  {
    "id": "bsnes_libretro",
    "core": "bsnes_libretro",
    "name": "bsnes"
  },
  {
    "id": "flycast_libretro",
    "core": "flycast_libretro",
    "name": "Flycast"
  },
  {
    "id": "mednafen_saturn_libretro",
    "core": "mednafen_saturn_libretro",
    "name": "Beetle Saturn"
  },
  {
    "id": "duckstation",
    "name": "DuckStation",
    "arg": "-fullscreen --",
    "platform": {
      "linux": {
        "flatpak": "org.duckstation.DuckStation"
      },
      "darwin": {
        "bin": "/Applications/DuckStation.app/Contents/MacOS/DuckStation"
      }
    }
  },
  {
    "id": "ppsspp",
    "name": "PPSSPP",
    "arg": "--fullscreen",
    "platform": {
      "linux": {
        "flatpak": "org.ppsspp.PPSSPP"
      },
      "darwin": {
        "bin": "/Applications/PPSSPPSDL.app/Contents/MacOS/PPSSPPSDL"
      }
    }
  },
  {
    "id": "pcsx2",
    "name": "PCSX2",
    "arg": "-fullscreen --",
    "platform": {
      "linux": {
        "bin": "%HOMEDIR%/Applications/pcsx2-Qt.AppImage"
      },
      "darwin": {
        "bin": "/Applications/PCSX2-v1.7.5516.app/Contents/MacOS/PCSX2"
      }
    }
  },
  {
    "id": "cemu",
    "name": "Cemu",
    "arg": "-g",
    "platform": {
      "linux": {
        "bin": "%HOMEDIR%/Applications/Cemu.AppImage"
      },
      "darwin": {
        "bin": "/Applications/Cemu.app/Contents/MacOS/Cemu"
      }
    }
  },
  {
    "id": "yuzu",
    "name": "Yuzu",
    "arg": "-g",
    "platform": {
      "linux": {
        "bin": "%HOMEDIR%/Applications/yuzu.AppImage"
      },
    }
  },
  {
    "id": "dolphin",
    "name": "Dolphin",
    "platform": {
      "linux": {
        "flatpak": "org.DolphinEmu.dolphin-emu"
      },
      "darwin": {
        "bin": "/Applications/Dolphin.app/Contents/MacOS/Dolphin"
      }
    }
  },
  {
    "id": "vita3k",
    "name": "Vita3K",
    "platform": {
      "darwin": {
        "bin": "/Applications/Vita3K.app/Contents/MacOS/Vita3K"
      },
      "linux": {
        "bin": "%HOMEDIR%/Applications/Vita3K/Vita3K"
      }
    },
    "launchCommands": {
      ".bin": "%EMUPATH% --fullscreen -r %ROMDIRNAME%",
      ".psvita": "%EMUPATH% --fullscreen -r %ROMTEXTCONTENT%"
    }
  }
]

const parseBin = (bin: string) => {
  return bin
    .replaceAll("%HOMEDIR%", window.homedir)
}

const parsedEmulators = defaultEmulators.map(emulator => {
  const { platform, ...emulatorConfig } = emulator;
  const platformData = platform?.[window.platform];

  if(platform && !platformData) return null;

  const withPlatformData = {
    ...emulatorConfig,
    ...(platformData ?? {})
  }

  if("bin" in withPlatformData && withPlatformData.bin) {
    return {
      ...withPlatformData,
      bin: parseBin(withPlatformData.bin)
    }
  }

  return withPlatformData;
}).filter(Boolean) as Emulator[]

const mergedEmulators = mergeWith(parsedEmulators, window.configStorage.getItem('emulators', []), merger);
window.configStorage.setItem('emulators', mergedEmulators);

export default parsedEmulators;
