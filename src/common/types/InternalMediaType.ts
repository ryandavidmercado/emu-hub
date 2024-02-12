import { Input } from "./Input"

export type InternalMediaType = 'system'
export type MediaImageData =
  | {
      resourceCollection: 'systems'
      resourceId: string
      resourceType: 'logo' | 'image' | 'logoAlt'
    }
  | {
      resourceCollection: 'input'
      resourceId: 'base'
      resourceType: Input | "DPAD"
    }
  | string
