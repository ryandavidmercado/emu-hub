import ControllerForm, {
  ControllerFormEntry
} from '@renderer/components/ControllerForm/ControllerForm'
import { SectionProps } from '..'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { useAtom } from 'jotai'
import uiConfigAtom from '@renderer/atoms/ui'
import { ColorSchemeId, colorSchemes } from '@renderer/colors/colorSchemes'

const Interface = ({ inputPriority, isActive, onExit }: SectionProps) => {
  const [uiConfig, updateUiConfig] = useAtom(uiConfigAtom)

  const entries: ControllerFormEntry[] = [
    {
      id: 'column-count',
      type: 'number',
      label: 'Grid Columns',
      sublabel: 'Number of columns to display in system view and search results.',
      defaultValue: uiConfig.grid.columnCount,
      min: 2,
      max: 4,
      onNumber: (num) => {
        updateUiConfig((config) => {
          config.grid.columnCount = num
        })
      }
    },
    {
      id: 'color-scheme',
      type: 'selector',
      label: 'Color Scheme',
      value: uiConfig.colorScheme ?? 'default',
      options: colorSchemes.map((scheme) => ({
        id: scheme.id,
        label: scheme.label
      })),
      onSelect: (scheme) => {
        updateUiConfig((config) => {
          config.colorScheme = scheme as ColorSchemeId
        })
      },
      wraparound: true
    }
  ]

  useOnInput(
    (input) => {
      switch (input) {
        case Input.B:
        case Input.LEFT:
          onExit()
          break
      }
    },
    {
      disabled: !isActive,
      priority: inputPriority
    }
  )

  return <ControllerForm entries={entries} inputPriority={inputPriority} isActive={isActive} />
}

export default Interface
