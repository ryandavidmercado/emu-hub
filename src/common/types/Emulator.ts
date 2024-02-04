export type Emulator = {
  id: string
  name: string
  arg?: string
  launchCommand?: string
} & ({
  core: string
} | {
  flatpak: string
} | {
  bin: string
})
