export interface Emulator {
  id: string
  name: string
  arg?: string
  launchCommand?: string
  launchCommands?: {
    [ext: string]: string
  }
  location: {
    core: string
  } | {
    bin: string
  } | {
    darwin?: { name: string }
    linux?: { flatpak?: string, appImage?: string, binName?: string }
  }
}
