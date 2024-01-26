import { System } from "@common/types";
import defaultEmulators from "./emulators";
const emulatorIds = new Set(defaultEmulators.map(emu => emu.id));

const defaultSystems = [
  {
    "id": "psx",
    "name": "Sony PlayStation",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Playstation_logo_colour.svg/1280px-Playstation_logo_colour.svg.png",
    "hero": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/PlayStation-SCPH-1000-with-Controller.jpg/2880px-PlayStation-SCPH-1000-with-Controller.jpg",
    "emulators": [
      "duckstation"
    ],
    "fileExtensions": [
      ".iso",
      ".cso",
      ".chd",
      ".cue",
      ".m3u"
    ],
    "releaseYear": "1994",
    "company": "Sony"
  },
  {
    "id": "nes",
    "ssId": "3",
    "name": "Nintendo Entertainment System",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/NES_logo.svg/288px-NES_logo.svg.png?20230801110942",
    "hero": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/NES-Console-Set.jpg/2880px-NES-Console-Set.jpg",
    "emulators": [
      "mesen_libretro"
    ],
    "fileExtensions": [
      ".nes",
      ".zip"
    ],
    "stores": [
      {
        "id": "emudeck",
        "type": "emudeck",
        "name": "EmuDeck"
      }
    ],
    "releaseYear": "1986",
    "company": "Nintendo"
  },
  {
    "id": "wii",
    "name": "Nintendo Wii",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Wii_logo.png",
    "hero": "https://i.imgur.com/PWtkTsw.png",
    "fileExtensions": [
      ".iso",
      ".cso",
      ".rvz"
    ],
    "emulators": [
      "dolphin"
    ],
    "releaseYear": "2006",
    "company": "Nintendo"
  },
  {
    "id": "n64",
    "name": "Nintendo 64",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Nintendo_64_logo.png?20210112130405",
    "hero": "https://i.imgur.com/nhU1Xo4.png",
    "fileExtensions": [
      ".n64",
      ".z64",
      ".zip"
    ],
    "emulators": [
      "mupen64plus_next_libretro"
    ],
    "releaseYear": "1999",
    "company": "Nintendo"
  },
  {
    "id": "gc",
    "name": "Gamecube",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Nintendo_GameCube-06.svg/640px-Nintendo_GameCube-06.svg.png",
    "emulators": [
      "dolphin"
    ],
    "fileExtensions": [
      ".iso",
      ".cso",
      ".rvz"
    ],
    "releaseYear": "2001",
    "company": "Nintendo"
  },
  {
    "id": "dreamcast",
    "name": "Dreamcast",
    "releaseYear": "1998",
    "company": "Sega",
    "emulators": [
      "flycast_libretro"
    ],
    "fileExtensions": [
      ".gdi",
      ".cue",
      ".cdi",
      ".chd",
      ".elf",
      ".iso",
      ".m3u"
    ]
  },
  {
    "id": "gb",
    "name": "Game Boy",
    "releaseYear": "1989",
    "company": "Nintendo",
    "handheld": true,
    "stores": [
      {
        "id": "emudeck",
        "type": "emudeck",
        "name": "EmuDeck"
      }
    ],
    "fileExtensions": [
      ".gb",
      ".zip"
    ],
    "emulators": [
      "sameboy_libretro"
    ]
  },
  {
    "id": "gbc",
    "name": "Game Boy Color",
    "releaseYear": "1998",
    "company": "Nintendo",
    "handheld": true,
    "stores": [
      {
        "id": "emudeck",
        "type": "emudeck",
        "name": "EmuDeck"
      }
    ],
    "fileExtensions": [
      ".gbc",
      ".zip"
    ],
    "emulators": [
      "sameboy_libretro"
    ]
  },
  {
    "id": "gba",
    "name": "Game Boy Advance",
    "releaseYear": "2001",
    "company": "Nintendo",
    "handheld": true,
    "stores": [
      {
        "id": "emudeck",
        "type": "emudeck",
        "name": "EmuDeck"
      }
    ],
    "fileExtensions": [
      ".gba",
      ".zip"
    ],
    "emulators": [
      "mgba_libretro"
    ]
  },
  {
    "id": "nds",
    "name": "Nintendo DS",
    "releaseYear": "2004",
    "company": "Nintendo",
    "handheld": true,
    "emulators": [
      "melonds_libretro"
    ],
    "fileExtensions": [
      ".nds",
      ".srl"
    ]
  },
  {
    "id": "genesis",
    "name": "Sega Genesis",
    "releaseYear": "1988",
    "company": "Sega",
    "stores": [
      {
        "id": "emudeck",
        "type": "emudeck",
        "name": "EmuDeck"
      }
    ],
    "fileExtensions": [
      ".gen",
      ".zip"
    ],
    "emulators": [
      "genesis_plus_gx_libretro"
    ]
  },
  {
    "id": "ps2",
    "name": "Sony PlayStation 2",
    "releaseYear": "2000",
    "company": "Sony",
    "fileExtensions": [
      ".chd",
      ".elf",
      ".ciso",
      ".cso",
      ".mdf",
      ".nrg",
      ".bin"
    ],
    "emulators": [
      "pcsx2"
    ]
  },
  {
    "id": "psp",
    "name": "Sony PlayStation Portable",
    "releaseYear": "2004",
    "company": "Sony",
    "handheld": true,
    "emulators": [
      "ppsspp"
    ],
    "fileExtensions": [
      ".elf",
      ".iso",
      ".cso",
      ".prx",
      ".pbp"
    ]
  },
  {
    "id": "saturn",
    "name": "Sega Saturn",
    "releaseYear": "1994",
    "company": "Sega",
    "emulators": [
      "mednafen_saturn_libretro"
    ],
    "fileExtensions": [
      ".cue",
      ".toc",
      ".m3u",
      ".ccd",
      ".chd"
    ]
  },
  {
    "id": "snes",
    "name": "Super Nintendo Entertainment System",
    "releaseYear": "1995",
    "company": "Nintendo",
    "stores": [
      {
        "id": "emudeck",
        "type": "emudeck",
        "name": "EmuDeck"
      }
    ],
    "fileExtensions": [
      ".zip",
      ".sfc",
      ".smc"
    ],
    "emulators": [
      "bsnes_libretro"
    ]
  },
  {
    "id": "switch",
    "name": "Nintendo Switch",
    "releaseYear": "2017",
    "company": "Nintendo",
    "fileExtensions": [
      ".xci",
      ".nsp",
      ".nca",
      ".nso",
      ".nro"
    ],
    "emulators": [
      "yuzu"
    ]
  },
  {
    "id": "wiiu",
    "name": "Nintendo Wii U",
    "releaseYear": "2012",
    "company": "Nintendo",
    "fileExtensions": [
      ".wua"
    ],
    "emulators": [
      "cemu"
    ]
  }
]

const parsedSystems: System[] = defaultSystems.map(system => {
  const emulators = system.emulators.filter(e => emulatorIds.has(e))
  if(!emulators.length) return null;

  return {
    ...system,
    emulators
  }
}).filter(Boolean) as System[]

console.log(parsedSystems)
export default parsedSystems
