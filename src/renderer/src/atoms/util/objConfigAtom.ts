import { withImmer } from "jotai-immer";
import { atomWithStorage } from "jotai/utils";

interface ObjConfigOptions<T> {
  storageKey: string,
  defaults: T
}

export const objConfigAtom = <T extends Record<string, any>>(options: ObjConfigOptions<T>) => withImmer(
  atomWithStorage<T>(options.storageKey, options.defaults, window.configStorage, { getOnInit: true })
)
