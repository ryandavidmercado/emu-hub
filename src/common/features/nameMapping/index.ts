import { NameMapper } from '@common/types/NameMapper'
import { vitaMap, ps3Map } from './maps'

const nameMaps: Record<NameMapper, Record<string, string>> = {
  vita: vitaMap,
  ps3: ps3Map
}

export const nameMappers = Object.entries(nameMaps).reduce(
  (acc, [name, map]) => ({
    ...acc,
    [name]: (key: string) => map[key] ?? key
  }),
  {} as Record<NameMapper, (key: string) => string>
)
