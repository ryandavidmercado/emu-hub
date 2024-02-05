import { NameMapper } from "@common/types/NameMapper"
import { vitaMap } from "./nameMapping/maps"

const nameMaps: Record<NameMapper, Record<string, string>> = {
  "vita": vitaMap
}

export const nameMappers = Object.entries(nameMaps).reduce((acc, [name, map]) => ({
  ...acc,
  [name]: (key: string) => map[key] ?? key
}), {} as Record<NameMapper, (key: string) => string>)
