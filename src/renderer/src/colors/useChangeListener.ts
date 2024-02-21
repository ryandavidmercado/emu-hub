import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { colorSchemes, defaultSaturation, modifiableColors } from './colorSchemes'
import { appConfigAtom } from '@renderer/atoms/appConfig'

export const useColorChangeListener = () => {
  const [appConfig] = useAtom(appConfigAtom)

  useEffect(() => {
    let colorSchemeId = appConfig.ui.colorScheme
    let colorScheme = colorSchemes.find((scheme) => scheme.id === colorSchemeId)

    if (!colorScheme) {
      colorSchemeId = 'default'
      colorScheme = colorSchemes.find((scheme) => scheme.id === colorSchemeId)!
    }

    const { hue, saturation: colorSchemeSaturation } = colorScheme

    for (const modifiableColor of modifiableColors) {
      let { id, lightness, saturation: baseSaturation } = modifiableColor
      const saturation =
        baseSaturation === defaultSaturation
          ? colorSchemeSaturation ?? baseSaturation
          : baseSaturation

      const values = { hue, saturation, lightness }
      if (colorScheme.overrides?.[modifiableColor.id]) {
        for (const value of ['hue', 'saturation', 'lightness']) {
          const override = colorScheme.overrides[modifiableColor.id]?.[value]
          if (override) values[value] = override
        }
      }

      document.documentElement.style.setProperty(
        `--${id}`,
        `hsl(${values.hue}, ${values.saturation}%, ${values.lightness}%)`
      )
    }
  }, [appConfig.ui.colorScheme])
}
