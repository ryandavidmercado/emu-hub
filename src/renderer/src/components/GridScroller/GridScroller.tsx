import { ScrollerProps } from '../Scroller'
import { forwardRef, useEffect, useId, useMemo, useRef } from 'react'
import { VirtuosoGrid, VirtuosoGridHandle } from "react-virtuoso"
import { atom, useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { atomFamily } from 'jotai/utils'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import Label from '../Label/Label'
import css from './GridScroller.module.scss'
import { Game } from '@common/types/Game'
import GameTile from '../MediaTile/Presets/GameTile'

const activeCellAtom = atomFamily((_id: string) =>
  atom({
    row: 0,
    column: 0
  })
)

const GridScroller = ({
  isActive = true,
  elems,
  label,
  onSelect,
  onHighlight
}: ScrollerProps<Game>) => {
  const instanceId = useId()

  const [
    {
      ui: {
        grid: { columnCount }
      }
    }
  ] = useAtom(appConfigAtom)

  const rowCount = Math.ceil(elems.length / columnCount)
  const scrollerRef = useRef<VirtuosoGridHandle>(null)

  const [activeCell, setActiveCell] = useAtom(activeCellAtom(instanceId))

  const activeIndex = useMemo(() => {
    return activeCell.row * columnCount + activeCell.column;
  }, [activeCell, columnCount])

  const activeElem = useMemo(() => {
    return elems[activeIndex]
  }, [activeIndex, elems])

  useOnInput((input) => {
    const newCell = { ...activeCell }

    switch (input) {
      case Input.LEFT:
        newCell.column = Math.max(newCell.column - 1, 0)
        break
      case Input.RIGHT:
        newCell.column = Math.min(newCell.column + 1, columnCount - 1)
        break
      case Input.UP:
        newCell.row = Math.max(newCell.row - 1, 0)
        break
      case Input.DOWN:
        newCell.row = Math.min(newCell.row + 1, rowCount - 1)
        break
      case Input.A:
        return onSelect?.(activeElem)
    }

    let newIndex = newCell.row * columnCount + newCell.column
    const maxIndex = elems.length - 1

    if (newIndex > maxIndex) {
      const diff = newIndex - maxIndex

      newCell.row = rowCount - 1
      newCell.column = newCell.column - diff

      newIndex = maxIndex
    }

    onHighlight?.(elems[newIndex])
    setActiveCell(newCell)
  })

  const gridComponents = useMemo(() => {
    return {
      List: forwardRef<HTMLDivElement>(({ style, children, ...props }: any, ref) => {
        return (
          <div
            style={{
              ...style,
              display: "grid",
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`
            }}
            {...props}
            ref={ref}
          >
            {children}
          </div>
        )
      })
    }
  }, [columnCount])

  useEffect(() => {
    scrollerRef.current?.scrollToIndex({
      index: activeIndex,
      behavior: "smooth",
      align: 'center'
    })
  }, [activeIndex])

  return (
    <div className={css.container}>
      {label && (
        <Label
          label={label}
          sublabel={isActive ? activeElem?.name : undefined}
          className={css.label}
        />
      )}
      <div className={css.gridWrapper}>
        <VirtuosoGrid
          data={elems}
          components={gridComponents}
          itemContent={(index, game) => (
            <GameTile
              swapTransform
              className={css.tile}
              game={game}
              active={activeIndex === index}
            />
          )}
          style={{ overflowY: "hidden" }}
          ref={scrollerRef}
          overscan={{ main: 1000, reverse: 1000 }}
        />
      </div>
    </div>
  )
}

export default GridScroller
