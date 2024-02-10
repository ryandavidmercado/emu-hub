import { Emulator } from "@common/types";

export const raEmulatorEntry = {
  name: 'RetroArch',
  id: 'retroarch',
  location: {
    linux: {
      flatpak: 'org.libretro.RetroArch',
      appImage: 'RetroArch',
      binName: 'retroarch'
    },
    darwin: {
      name: 'RetroArch'
    }
  }
} as Emulator
