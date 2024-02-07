export type InternalMediaType = 'system'
export type MediaImageData =
  | {
      resourceCollection: 'systems'
      resourceId: string
      resourceType: 'logo' | 'image' | 'logoAlt'
    }
  | string
