import { IconType } from 'react-icons'
import css from './ControllerForm.module.scss'
import { CSSProperties, Dispatch, useCallback, useMemo, useState } from 'react'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import classNames from 'classnames'
import { Align, FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ReactNode, SetStateAction } from 'react'
import { motion } from 'framer-motion'
import { useInputModal } from '../InputModal/InputModal'
import { FaCaretLeft, FaCaretRight, FaRegKeyboard } from 'react-icons/fa'
import { useConfirmation } from '../ConfirmationModal/ConfirmationModal'

export type ColorScheme = 'default' | 'caution' | 'warning' | 'confirm'
export type SelectorOption = {
  id: string
  label: string | ReactNode
}

export type FormTypes =
  | {
      type: 'action'
      onSelect: (id: string) => void
      confirmation?: {
        text: string
        defaultToConfirmed?: boolean
      }
    }
  | {
      type: 'toggle'
      enabled: boolean
      setEnabled: (e: boolean) => void
      useDisableStyling?: boolean
    }
  | {
      type: 'input'
      defaultValue?: string
      inputLabel?: string
      isPassword?: boolean
      onInput: (input: string) => void
      hideFormWhileActive?: boolean
      inputStyle?: CSSProperties
    }
  | {
      type: 'number'
      defaultValue: number
      onNumber?: (number: number) => void
      min?: number
      max?: number
    }
  | {
      type: 'selector'
      value: string
      options: SelectorOption[]
      onSelect: (id: string) => void
      wraparound?: boolean
    }

export type ControllerFormEntry = {
  id: string
  label: string
  sublabel?: string
  Icon?: IconType
  IconActive?: IconType
  colorScheme?: ColorScheme
} & FormTypes

interface ItemData {
  entries: ControllerFormEntry[]
  activeIndex: number
  activeSelectorInput: string
  clearActiveSelectorInput: () => void
  inputPriority: number
  nextInput: () => void
  prevInput: () => void
}

interface Props {
  entries: ControllerFormEntry[]
  isActive: boolean
  controlledActiveIndex?: number
  controlledSetActiveIndex?: Dispatch<SetStateAction<number>>
  inputPriority?: number
  maxHeight?: string
  defaultSelection?: string
  scrollType?: Align
  hasParentContainer?: boolean
  wraparound?: boolean
}

const ControllerForm = ({
  entries,
  isActive,
  controlledActiveIndex,
  controlledSetActiveIndex,
  inputPriority,
  maxHeight,
  defaultSelection,
  scrollType,
  hasParentContainer = true,
  wraparound = true
}: Props) => {
  const defaultIndex = entries.findIndex((e) => e.id === defaultSelection)
  const [localActiveIndex, localSetActiveIndex] = useState(defaultIndex > -1 ? defaultIndex : 0)

  const activeIndex = controlledActiveIndex ?? localActiveIndex
  const setActiveIndex = controlledSetActiveIndex ?? localSetActiveIndex

  const activeEntry = entries[activeIndex]

  const [hiddenForInput, setHiddenForInput] = useState(false)
  const [activeSelectorInput, setActiveSelectorInput] = useState('')

  const getInput = useInputModal()
  const getConfirmation = useConfirmation()

  const onSelect = async () => {
    switch (activeEntry.type) {
      case 'action':
        if (activeEntry.confirmation) {
          const confirmed = await getConfirmation(activeEntry.confirmation)
          if (!confirmed) return
        }

        activeEntry.onSelect(activeEntry.id)
        break
      case 'toggle':
        activeEntry.setEnabled(!activeEntry.enabled)
        break
      case 'input':
        if (activeEntry.hideFormWhileActive) setHiddenForInput(true)

        const newValue = await getInput({
          label: activeEntry.inputLabel ?? activeEntry.label,
          defaultValue: activeEntry.defaultValue,
          isPassword: activeEntry.isPassword,
          style: activeEntry.inputStyle
        })

        setHiddenForInput(false)
        if (!newValue) return
        activeEntry.onInput(newValue)
        break
      case 'selector':
        if (activeEntry.options.length > 1) setActiveSelectorInput(activeEntry.id)
        break
      case 'number':
        setActiveSelectorInput(activeEntry.id)
        break
    }
  }

  const prevInput = useCallback(() => {
    setActiveIndex((i) => {
      if (i === 0) {
        return wraparound ? entries.length - 1 : i
      }

      return i - 1
    })
  }, [wraparound, entries.length])

  const nextInput = useCallback(() => {
    setActiveIndex((i) => {
      if (i === entries.length - 1) {
        return wraparound ? 0 : i
      }
      return i + 1
    })
  }, [wraparound, entries.length])

  useOnInput(
    (input) => {
      switch (input) {
        case Input.A:
          onSelect()
          break
        case Input.DOWN:
          nextInput()
          break
        case Input.UP:
          prevInput()
          break
      }
    },
    {
      disabled: !isActive,
      priority: inputPriority,
      hints: [
        { input: Input.A, text: "Select" }
      ]
    }
  )

  const itemData = useMemo<ItemData>(
    () => ({
      entries,
      activeIndex,
      activeSelectorInput,
      inputPriority: inputPriority ?? 0,
      clearActiveSelectorInput: () => {
        setActiveSelectorInput('')
      },
      nextInput,
      prevInput
    }),
    [entries, activeIndex, activeSelectorInput, inputPriority, nextInput, prevInput]
  )

  if (hiddenForInput) return null
  return (
    <div
      className={css.controllerForm}
      style={{
        height: (() => {
          const entriesHeight = entries.length * 100
          if (maxHeight) return `min(${entriesHeight}px, ${maxHeight})`
          if (hasParentContainer) return `min(${entriesHeight}px, 100%)`
          return entriesHeight
        })()
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <List
            className={css.transparentScrollBar}
            itemData={itemData}
            height={height}
            width={width}
            itemCount={entries.length}
            itemSize={100}
            ref={(elem) => {
              elem?.scrollToItem(activeIndex, scrollType ?? 'auto')
            }}
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            {ListEntry}
          </List>
        )}
      </AutoSizer>
    </div>
  )
}

interface ListEntryProps {
  style: CSSProperties
  data: ItemData
  index: number
}

const ListEntry = ({ index, style, data }: ListEntryProps) => {
  const { entries, activeIndex } = data
  const entry = entries[index]

  const isActive = index === activeIndex

  return (
    <div
      key={entry.id}
      className={classNames(
        css.entry,
        index === activeIndex && css.active,
        css[entry.colorScheme ?? 'default']
      )}
      style={style}
    >
      <div className={css.left}>
        <div>{entry.label}</div>
        {entry.sublabel && (
          <div className={classNames(css.sublabel, isActive && css.active)}>{entry.sublabel}</div>
        )}
      </div>
      {entry.type === 'toggle' && (
        <Toggle
          active={isActive}
          enabled={entry.enabled}
          useDisableStyling={entry.useDisableStyling}
        />
      )}
      {entry.type === 'number' && (
        <NumberDisplay
          value={entry.defaultValue ?? 0}
          min={entry.min}
          max={entry.max}
          active={data.activeSelectorInput === entry.id}
          inputPriority={data.inputPriority + 1}
          onExit={data.clearActiveSelectorInput}
          onNumber={entry.onNumber}
          nextInput={data.nextInput}
          prevInput={data.prevInput}
        />
      )}
      {entry.type === 'selector' && (
        <Selector
          value={entry.value}
          inputPriority={data.inputPriority + 1}
          onExit={data.clearActiveSelectorInput}
          active={data.activeSelectorInput === entry.id}
          prevInput={data.prevInput}
          nextInput={data.nextInput}
          options={entry.options}
          onSelect={entry.onSelect}
          wraparound={entry.wraparound}
        />
      )}
      {(() => {
        const defaultIcons: Partial<Record<FormTypes['type'], IconType>> = {
          input: FaRegKeyboard
        }

        const IconElem =
          (isActive ? entry.IconActive ?? entry.Icon : entry.Icon) ?? defaultIcons[entry.type]

        return IconElem ? <IconElem /> : null
      })()}
    </div>
  )
}

const Toggle = ({
  active,
  enabled,
  useDisableStyling = true
}: {
  active: boolean
  enabled: boolean
  useDisableStyling?: boolean
}) => {
  return (
    <motion.div
      className={classNames(css.toggleOuter, active && css.active, enabled && css.enabled)}
    >
      <motion.div
        layout
        transition={{
          type: 'spring',
          mass: 0.2,
          damping: 12,
          stiffness: 180
        }}
        className={classNames(css.toggleInner, (enabled || !useDisableStyling) && css.enabled)}
      />
    </motion.div>
  )
}

interface SelectorProps {
  value: string
  inputPriority: number
  active: boolean
  onExit: () => void
  onSelect: (id: string) => void
  nextInput: () => void
  prevInput: () => void
  options: SelectorOption[]
  wraparound?: boolean
}

const Selector = ({
  active,
  value,
  inputPriority,
  onExit,
  onSelect,
  nextInput,
  prevInput,
  options,
  wraparound
}: SelectorProps) => {
  let activeOptionIndex = options.findIndex((opt) => opt.id === value)
  if (activeOptionIndex === -1) activeOptionIndex = 0

  const canGoLeft = activeOptionIndex > 0 || (wraparound && options.length > 1)
  const canGoRight = activeOptionIndex < options.length - 1 || (wraparound && options.length > 1)

  useOnInput(
    (input) => {
      switch (input) {
        case Input.DOWN:
          nextInput()
          onExit()
          break
        case Input.UP:
          prevInput()
          onExit()
          break
        case Input.LEFT:
          if (activeOptionIndex === 0) {
            if (!wraparound) return
            return onSelect(options[options.length - 1].id)
          }
          onSelect(options[activeOptionIndex - 1].id)
          break
        case Input.RIGHT:
          if (activeOptionIndex === options.length - 1) {
            if (!wraparound) return
            return onSelect(options[0].id)
          }
          onSelect(options[activeOptionIndex + 1].id)
          break
        case Input.A:
        case Input.B:
          onExit()
      }
    },
    {
      disabled: !active,
      priority: inputPriority,
      hints: [
        { input: "DPADLR", text: 'Change Selection' },
        { input: Input.A, text: 'Select' }
      ]
    }
  )

  return (
    <div className={classNames(css.selectorInput, active && css.active)}>
      <FaCaretLeft className={classNames(css.caret, !canGoLeft && css.disabled)} />
      <div>{options[activeOptionIndex].label}</div>
      <FaCaretRight className={classNames(css.caret, !canGoRight && css.disabled)} />
    </div>
  )
}

interface NumberDisplayProps {
  value: number
  min?: number
  max?: number
  inputPriority: number
  active: boolean
  onExit: () => void
  onNumber?: (number: number) => void
  nextInput: () => void
  prevInput: () => void
}

const NumberDisplay = ({
  active,
  value,
  min,
  max,
  inputPriority,
  onExit,
  onNumber,
  nextInput,
  prevInput
}: NumberDisplayProps) => {
  const canGoLeft = min === undefined || value > min
  const canGoRight = max === undefined || value < max

  useOnInput(
    (input) => {
      switch (input) {
        case Input.DOWN:
          nextInput()
          onExit()
          break
        case Input.UP:
          prevInput()
          onExit()
          break
        case Input.LEFT:
          onNumber?.(Math.max(value - 1, min ?? 0))
          break
        case Input.RIGHT:
          onNumber?.(Math.min(value + 1, max ?? Infinity))
          break
        case Input.A:
        case Input.B:
          onExit()
      }
    },
    {
      disabled: !active,
      priority: inputPriority,
      hints: [
        { input: "DPADLR", text: 'Change Selection' },
        { input: Input.A, text: 'Select' }
      ]
    }
  )

  return (
    <div className={classNames(css.selectorInput, active && css.active)}>
      <FaCaretLeft className={classNames(css.caret, !canGoLeft && css.disabled)} />
      <div>{value}</div>
      <FaCaretRight className={classNames(css.caret, !canGoRight && css.disabled)} />
    </div>
  )
}

export default ControllerForm
