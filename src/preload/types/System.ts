export type SystemStore = {
  id: string
  name: string
} & ({
  type: "html"
  url: string
  selector: string
} | ({
  type: "emudeck"
}))

export interface System {
  id: string,
  ssId?: string,
  name: string,
  logo: string,
  emulators?: string[]
  fileExtensions: string[]
}
