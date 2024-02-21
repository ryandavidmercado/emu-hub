import ControllerForm, {
  ControllerFormEntry
} from '@renderer/components/ControllerForm/ControllerForm'
import { SectionProps } from '..'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { useAtom } from 'jotai'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import { colorSchemes } from '@renderer/colors/colorSchemes'
import { ColorSchemeId } from '@common/types'

const Interface = ({ inputPriority, isActive, onExit }: SectionProps) => {
  const [appConfig, updateAppConfig] = useAtom(appConfigAtom)

  const entries: ControllerFormEntry[] = [
    {
      id: 'color-scheme',
      type: 'selector',
      label: 'Color Scheme',
      value: appConfig.ui.colorScheme ?? 'default',
      options: colorSchemes.map((scheme) => ({
        id: scheme.id,
        label: scheme.label
      })),
      onSelect: (scheme) => {
        updateAppConfig((config) => {
          config.ui.colorScheme = scheme as ColorSchemeId
        })
      },
      wraparound: true
    },
    {
      id: 'show-controller-hint',
      type: 'toggle',
      label: 'Enable Controller Hints',
      enabled: appConfig.ui.controllerHints,
      setEnabled: (e) => { updateAppConfig((config) => { config.ui.controllerHints = e })}
    },
    {
      id: 'column-count',
      type: 'number',
      label: 'Game Grid Columns',
      sublabel: 'Number of columns to display in game grids (search, all games, etc).',
      defaultValue: appConfig.ui.grid.columnCount,
      min: 2,
      max: 5,
      onNumber: (num) => {
        updateAppConfig((config) => {
          config.ui.grid.columnCount = num
        })
      }
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
