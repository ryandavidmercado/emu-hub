import { System } from '@common/types'
import defaultEmulators from './emulators'
import { mergeWith } from 'lodash'
import { merger } from './util/merger'

const emulatorIds = new Set(defaultEmulators.map((emu) => emu.id))

const defaultSystems = [
  {
    id: 'psx',
    ssId: 57,
    name: 'Sony PlayStation',
    emulators: ['duckstation'],
    fileExtensions: ['.iso', '.cso', '.chd', '.cue', '.m3u'],
    releaseYear: '1994',
    company: 'Sony'
  },
  {
    id: 'nes',
    ssId: 3,
    name: 'Nintendo Entertainment System',
    emulators: ['mesen_libretro', 'nestopia_libretro'],
    fileExtensions: ['.nes', '.zip'],
    stores: [
      {
        id: 'emudeck',
        type: 'emudeck',
        name: 'EmuDeck'
      }
    ],
    releaseYear: '1986',
    company: 'Nintendo'
  },
  {
    id: 'wii',
    ssId: 16,
    name: 'Nintendo Wii',
    fileExtensions: ['.iso', '.cso', '.rvz', '.wbfs'],
    emulators: ['dolphin'],
    releaseYear: '2006',
    company: 'Nintendo'
  },
  {
    id: 'n64',
    ssId: 14,
    name: 'Nintendo 64',
    fileExtensions: ['.n64', '.z64', '.zip'],
    emulators: ['mupen64plus_next_libretro', 'parallel_n64_libretro'],
    releaseYear: '1999',
    company: 'Nintendo'
  },
  {
    id: 'gc',
    ssId: 13,
    name: 'Gamecube',
    emulators: ['dolphin'],
    fileExtensions: ['.iso', '.cso', '.rvz'],
    releaseYear: '2001',
    company: 'Nintendo'
  },
  {
    id: 'dreamcast',
    ssId: 23,
    name: 'Dreamcast',
    releaseYear: '1998',
    company: 'Sega',
    emulators: ['flycast_libretro'],
    fileExtensions: ['.gdi', '.cue', '.cdi', '.chd', '.elf', '.iso', '.m3u']
  },
  {
    id: 'gb',
    ssId: 9,
    name: 'Game Boy',
    releaseYear: '1989',
    company: 'Nintendo',
    handheld: true,
    stores: [
      {
        id: 'emudeck',
        type: 'emudeck',
        name: 'EmuDeck'
      }
    ],
    fileExtensions: ['.gb', '.zip'],
    emulators: ['sameboy_libretro']
  },
  {
    id: 'gbc',
    ssId: 10,
    name: 'Game Boy Color',
    releaseYear: '1998',
    company: 'Nintendo',
    handheld: true,
    stores: [
      {
        id: 'emudeck',
        type: 'emudeck',
        name: 'EmuDeck'
      }
    ],
    fileExtensions: ['.gbc', '.zip'],
    emulators: ['sameboy_libretro']
  },
  {
    id: 'gba',
    ssId: 12,
    name: 'Game Boy Advance',
    releaseYear: '2001',
    company: 'Nintendo',
    handheld: true,
    stores: [
      {
        id: 'emudeck',
        type: 'emudeck',
        name: 'EmuDeck'
      }
    ],
    fileExtensions: ['.gba', '.zip'],
    emulators: ['mgba_libretro']
  },
  {
    id: 'nds',
    ssId: 15,
    name: 'Nintendo DS',
    releaseYear: '2004',
    company: 'Nintendo',
    handheld: true,
    emulators: ['melonds_libretro'],
    fileExtensions: ['.nds', '.srl']
  },
  {
    id: 'genesis',
    ssId: 1,
    name: 'Sega Genesis',
    releaseYear: '1988',
    company: 'Sega',
    stores: [
      {
        id: 'emudeck',
        type: 'emudeck',
        name: 'EmuDeck'
      }
    ],
    fileExtensions: ['.gen', '.zip'],
    emulators: ['genesis_plus_gx_libretro']
  },
  {
    id: 'ps2',
    ssId: 52,
    name: 'Sony PlayStation 2',
    releaseYear: '2000',
    company: 'Sony',
    fileExtensions: ['.chd', '.elf', '.ciso', '.cso', '.mdf', '.nrg', '.bin', '.iso'],
    emulators: ['pcsx2']
  },
  {
    id: 'psp',
    ssId: 61,
    name: 'Sony PlayStation Portable',
    releaseYear: '2004',
    company: 'Sony',
    handheld: true,
    emulators: ['ppsspp'],
    fileExtensions: ['.elf', '.iso', '.cso', '.prx', '.pbp']
  },
  {
    id: 'saturn',
    ssId: 22,
    name: 'Sega Saturn',
    releaseYear: '1994',
    company: 'Sega',
    emulators: ['mednafen_saturn_libretro'],
    fileExtensions: ['.cue', '.toc', '.m3u', '.ccd', '.chd']
  },
  {
    id: 'snes',
    ssId: 4,
    name: 'Super Nintendo Entertainment System',
    releaseYear: '1995',
    company: 'Nintendo',
    stores: [
      {
        id: 'emudeck',
        type: 'emudeck',
        name: 'EmuDeck'
      }
    ],
    fileExtensions: ['.zip', '.sfc', '.smc'],
    emulators: ['bsnes_libretro']
  },
  {
    id: 'switch',
    ssId: 225,
    name: 'Nintendo Switch',
    releaseYear: '2017',
    company: 'Nintendo',
    fileExtensions: ['.xci', '.nsp', '.nca', '.nso', '.nro'],
    emulators: ['yuzu']
  },
  {
    id: 'wiiu',
    ssId: 18,
    name: 'Nintendo Wii U',
    releaseYear: '2012',
    company: 'Nintendo',
    fileExtensions: ['.wua', '.rpx'],
    emulators: ['cemu'],
    defaultNames: {
      '.rpx': {
        type: 'pathToken',
        token: -2
      }
    }
  },
  {
    id: 'psvita',
    igdbId: 46,
    ssId: 62,
    name: 'Sony PlayStation Vita',
    handheld: true,
    releaseYear: '2011',
    company: 'Sony',
    fileExtensions: ['.psvita', '.bin'],
    emulators: ['vita3k'],
    defaultNames: {
      '.bin': {
        type: 'pathToken',
        token: -1,
        map: 'vita'
      }
    }
  },
  {
    id: 'ps3',
    igdbId: 9,
    ssId: 59,
    name: 'Sony PlayStation 3',
    releaseYear: '2006',
    company: 'Sony',
    fileExtensions: ['.ps3', '.bin'],
    emulators: ['rpcs3'],
    defaultNames: {
      '.bin': {
        type: 'pathToken',
        token: -2,
        map: 'ps3'
      }
    }
  }
]

const parsedSystems: System[] = defaultSystems
  .map((system) => {
    const emulators = system.emulators.filter((e) => emulatorIds.has(e))
    if (!emulators.length) return null

    return {
      ...system,
      emulators
    }
  })
  .filter(Boolean) as System[]

const mergedSystems = mergeWith(parsedSystems, window.configStorage.getItem('systems', []), merger)
window.configStorage.setItem('systems', mergedSystems)

export default parsedSystems
