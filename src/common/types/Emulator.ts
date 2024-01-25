export type Emulator = {
  id: string
  name: string
  arg?: string
} & ({
  core: string
} | {
  flatpak: string
} | {
  bin: string
})
