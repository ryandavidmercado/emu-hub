export type SystemStore = {
  id: string
  url: string
  name: string
} & ({
  type: "html"
  selector: string
})

export interface System {
  id: string,
  ssId?: string,
  name: string,
  logo: string,
  emulators?: string[]
  fileExtensions: string[]
}
