export type Emulator = {
  id: string
  name: string
} & ({
  core: string
} | {
  bin: string
})
