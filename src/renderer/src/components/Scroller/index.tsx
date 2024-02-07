import classNames from 'classnames'
import { CSSProperties, Ref, useEffect, useRef, useState } from 'react'
import css from './Scroller.module.scss'
import { useKeepVisible, useOnInput } from '../../hooks'
import { Input, ScrollType } from '../../enums'
import Label from '../Label/Label'
import { System } from '@common/types/System'
import { Game } from '@common/types'
import SystemTile from '../MediaTile/Presets/SystemTile'
import GameTile from '../MediaTile/Presets/GameTile'

export interface ScrollerProps<T extends Game | System> {
  aspectRatio?: 'landscape' | 'square'
  style?: CSSProperties
  elems: T[]
  label?: string
  isActive?: boolean
  onHighlight?: (arg0: T) => void
  onSelect?: (arg0: T) => void
  onNextScroller?: () => void
  onPrevScroller?: () => void
  onActiveChange?: (active: boolean) => void
  forwardedRef?: Ref<HTMLDivElement>
  disableInput?: boolean
  contentType?: 'game' | 'system'
}

export const Scroller = <T extends Game | System>({
  aspectRatio = 'landscape',
  style,
  elems,
  label,
  isActive = true,
  forwardedRef,
  onHighlight,
  onSelect,
  onPrevScroller,
  onNextScroller,
  onActiveChange,
  disableInput,
  contentType
}: ScrollerProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const getIsSystem = (_elem: Game | System): _elem is System => {
    return contentType === 'system'
  }

  useEffect(() => {
    onActiveChange?.(isActive)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    onHighlight?.(elems[activeIndex])
  }, [activeIndex, isActive])

  const activeRef = useRef<HTMLDivElement>(null)

  const displayElems = elems.map((elem, i) => {
    const elemIsActive = i === activeIndex
    const isSystem = getIsSystem(elem)

    const tileProps = {
      key: elem.id,
      activeRef: activeRef,
      active: elemIsActive && isActive,
      aspectRatio
    }

    return isSystem ? (
      <SystemTile system={elem} {...tileProps} />
    ) : (
      <GameTile game={elem} {...tileProps} />
    )
  })

  useOnInput(
    (input) => {
      const handlePrev = () => {
        setActiveIndex((i) => Math.max(i - 1, 0))
      }

      const handleNext = () => {
        setActiveIndex((i) => Math.min(i + 1, elems.length - 1))
      }

      switch (input) {
        case Input.LEFT:
          handlePrev()
          break
        case Input.RIGHT:
          handleNext()
          break
        case Input.UP:
          onPrevScroller?.()
          break
        case Input.DOWN:
          onNextScroller?.()
          break
        case Input.A:
          onSelect?.(elems[activeIndex])
          break
      }
    },
    {
      disabled: !isActive || disableInput
    }
  )

  useKeepVisible(activeRef, 35, ScrollType.HORIZONTAL, isActive)

  const activeElem = elems[activeIndex]

  return (
    <div
      className={classNames({
        [css.container]: true,
        [css.inActive]: !isActive
      })}
      style={style}
      ref={forwardedRef}
    >
      {label && (
        <Label
          className={css.label}
          label={label}
          sublabel={isActive ? activeElem?.name : undefined}
        />
      )}
      <div className={css.main}>{displayElems}</div>
    </div>
  )
}
