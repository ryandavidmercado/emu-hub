export type ColorSchemeId = 'default' | 'burgendy'

interface ColorScheme {
  id: string
  label: string
  hue: number
  saturation?: number
  overrides?: {
    [color: string]: {
      hue?: number
      saturation?: number
      lightness?: number
    }
  }
}

export const colorSchemes: ColorScheme[] = [
  {
    id: 'default',
    label: 'Night Ocean (Default)',
    hue: 200
  },
  {
    id: 'violet',
    label: 'Violet',
    hue: 250,
    saturation: 25
  },
  {
    id: 'aquamarine',
    label: 'Aquamarine',
    hue: 165,
    saturation: 70,
    overrides: {
      'background-medium': { lightness: 12 }
    }
  },
  {
    id: 'copper',
    label: 'Copper',
    hue: 360,
    saturation: 18,
    overrides: {
      background: { lightness: 18 },
      'background-medium': { lightness: 13 },
      'background-dark': { lightness: 8 }
    }
  },
  {
    id: 'crimson',
    label: 'Crimson',
    hue: 0,
    saturation: 50
  },
  {
    id: 'pc-classic',
    label: 'PC Classic',
    hue: 99,
    saturation: 15,
    overrides: {
      background: { lightness: 30 },
      'background-medium': { lightness: 12 },
      'background-light': { lightness: 35 }
    }
  }
]

export const defaultSaturation = 15

export const modifiableColors = [
  { id: 'background', saturation: defaultSaturation, lightness: 20 } as const,
  { id: 'background-medium', saturation: defaultSaturation, lightness: 12 } as const,
  { id: 'background-dark', saturation: defaultSaturation, lightness: 10 } as const,
  { id: 'background-light', saturation: defaultSaturation, lightness: 30 } as const,
  { id: 'background-lighter', saturation: defaultSaturation, lightness: 40 } as const,
  { id: 'primary', saturation: 30, lightness: 84 } as const
] as const
