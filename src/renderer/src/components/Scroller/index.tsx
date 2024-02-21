import classNames from 'classnames'
import { CSSProperties, Ref, useEffect, useId, useRef } from 'react'
import css from './Scroller.module.scss'
import { useKeepVisible, useOnInput, useDeferredValue } from '../../hooks'
import { Input, ScrollType } from '../../enums'
import Label from '../Label/Label'
import { System } from '@common/types/System'
import { Game } from '@common/types'
import SystemTile from '../MediaTile/Presets/SystemTile'
import GameTile from '../MediaTile/Presets/GameTile'
import { useIndexParam } from '@renderer/util/queryParams/IndexParam'

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
  id?: string
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
  contentType,
  id: propsId
}: ScrollerProps<T>) => {
  const instanceId = useId()
  const id = propsId ?? instanceId

  const scrollBehavior = useDeferredValue('smooth', 'initial')

  const [activeIndex, setActiveIndex] = useIndexParam(id)
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

  const activeElem = elems[activeIndex];
  const isSystem = getIsSystem(activeElem);

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
      disabled: !isActive || disableInput,
      hints: [
        { input: Input.A, text: `Select ${isSystem ? 'System' : 'Game'}` }
      ]
    }
  )

  useKeepVisible(activeRef, 35, ScrollType.HORIZONTAL, isActive)

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
      <div className={css.main} style={{ scrollBehavior }}>{displayElems}</div>
    </div>
  )
}
