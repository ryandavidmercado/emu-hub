export type Emulator = {
  id: string
  name: string
  arg?: string
  launchCommand?: string
  launchCommands?: {
    [ext: string]: string
  }
} & ({
  core: string
} | {
  flatpak: string
} | {
  bin: string
})
