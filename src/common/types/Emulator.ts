export type Emulator = {
  id: string
  name: string
} & ({
  core: string
} | {
  bin: string | {
    win32: string
    linux: string
    darwin: string
  }
})
