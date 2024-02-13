const defaultEmulators = [
  {
    id: 'mesen_libretro',
    location: { core: 'mesen_libretro' },
    name: 'Mesen'
  },
  {
    id: 'nestopia_libretro',
    location: { core: 'nestopia_libretro' },
    name: 'Nestopia UE'
  },
  {
    id: 'mupen64plus_next_libretro',
    name: 'Mupen64Plus-Next',
    location: { core: 'mupen64plus_next_libretro' }
  },
  {
    id: 'parallel_n64_libretro',
    location: { core: 'parallel_n64_libretro' },
    name: 'ParaLLEl N64'
  },
  {
    id: 'sameboy_libretro',
    location: { core: 'sameboy_libretro' },
    name: 'SameBoy'
  },
  {
    id: 'gambatte_libretro',
    location: { core: 'gambatte_libretro' },
    name: 'Gambatte'
  },
  {
    id: 'mgba_libretro',
    location: { core: 'mgba_libretro' },
    name: 'mGBA'
  },
  {
    id: 'melonds_libretro',
    location: { core: 'melonds_libretro' },
    name: 'MelonDS'
  },
  {
    id: 'genesis_plus_gx_libretro',
    location: { core: 'genesis_plus_gx_libretro' },
    name: 'Genesis Plus GX'
  },
  {
    id: 'bsnes_libretro',
    location: { core: 'bsnes_libretro' },
    name: 'bsnes'
  },
  {
    id: 'flycast_libretro',
    location: { core: 'flycast_libretro' },
    name: 'Flycast'
  },
  {
    id: 'mednafen_saturn_libretro',
    location: { core: 'mednafen_saturn_libretro' },
    name: 'Beetle Saturn'
  },
  {
    id: 'duckstation',
    name: 'DuckStation',
    args: ['-fullscreen', '-nogui', '--'],
    location: {
      linux: {
        appImage: 'DuckStation',
        flatpak: 'org.duckstation.DuckStation'
      },
      darwin: {
        name: 'DuckStation'
      }
    }
  },
  {
    id: 'ppsspp',
    name: 'PPSSPP',
    args: ['--fullscreen'],
    location: {
      linux: {
        flatpak: 'org.ppsspp.PPSSPP'
      },
      darwin: {
        name: 'PPSSPPSDL'
      }
    }
  },
  {
    id: 'pcsx2',
    name: 'PCSX2',
    args: ['-fullscreen', '-nogui', '--'],
    location: {
      linux: {
        appImage: 'pcsx2',
        flatpak: 'net.pcsx2.PCSX2'
      },
      darwin: {
        name: 'PCSX2'
      }
    }
  },
  {
    id: 'cemu',
    name: 'Cemu',
    args: ['-g'],
    location: {
      linux: {
        appImage: 'Cemu',
        flatpak: 'info.cemu.Cemu'
      },
      darwin: {
        name: 'Cemu'
      }
    }
  },
  {
    id: 'yuzu',
    name: 'Yuzu',
    args: ['-g'],
    location: {
      linux: {
        appImage: 'yuzu',
        flatpak: 'org.yuzu_emu.yuzu'
      }
    }
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    location: {
      linux: {
        flatpak: 'org.DolphinEmu.dolphin-emu',
      },
      darwin: {
        name: 'Dolphin'
      }
    },
    args: ['--config', 'Dolphin.Display.Fullscreen=True', '--batch', '-e']
  },
  {
    id: 'vita3k',
    name: 'Vita3K',
    location: {
      darwin: {
        name: 'Vita3K'
      },
      linux: {
        binName: 'Vita3K'
      }
    },
    killSignal: "SIGKILL",
    launchCommands: {
      '.bin': '%EMUPATH% --fullscreen -r %ROMDIRNAME%',
      '.psvita': '%EMUPATH% --fullscreen -r %ROMTEXTCONTENT%'
    }
  },
  {
    id: 'rpcs3',
    name: 'RPCS3',
    location: {
      darwin: {
        name: 'RPCS3'
      },
      linux: {
        flatpak: 'net.rpcs3.RPCS3',
        appImage: 'rpcs3'
      }
    },
    args: [
      '--no-gui',
      '--fullscreen'
    ]
  }
]

export default defaultEmulators
