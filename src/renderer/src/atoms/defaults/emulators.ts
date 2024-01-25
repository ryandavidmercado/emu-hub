import { Emulator } from "@common/types"

const defaultEmulators = [
  {
    "id": "mesen_libretro",
    "core": "mesen_libretro",
    "name": "Mesen"
  },
  {
    "id": "mupen64plus_next_libretro",
    "core": "mupen64plus_next_libretro",
    "name": "Mupen64Plus-Next"
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
    "platform": {
      "linux": {
        "flatpak": "org.duckstation.DuckStation"
      }
    }
  },
  {
    "id": "ppsspp",
    "name": "PPSSPP",
    "platform": {
      "linux": {
        "flatpak": "org.ppsspp.PPSSPP"
      }
    }
  },
  {
    "id": "pcsx2",
    "name": "PCSX2",
    "platform": {
      "linux": {
        "bin": "%HOMEDIR%/Applications/pcsx2-Qt.AppImage"
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
  }
]

const parseBin = (bin: string) => {
  return bin
    .replaceAll("%HOMEDIR%", window.homedir)
}

const parsedEmulators: Emulator[] = defaultEmulators.map(emulator => {
  const { platform, ...emulatorConfig } = emulator;
  const platformData = platform?.[window.platform];

  if(platform && !platformData) return null;

  const withPlatformData = {
    ...emulatorConfig,
    ...(platformData ?? {})
  }

  if(withPlatformData.bin) {
    return {
      ...withPlatformData,
      bin: parseBin(withPlatformData.bin)
    }
  }

  return withPlatformData;
}).filter(Boolean)

export default parsedEmulators;