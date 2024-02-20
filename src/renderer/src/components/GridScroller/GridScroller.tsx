import { ScrollerProps } from '../Scroller'
import { forwardRef, useEffect, useId, useMemo, useRef } from 'react'
import { VirtuosoGrid, VirtuosoGridHandle } from "react-virtuoso"
import { useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import Label from '../Label/Label'
import css from './GridScroller.module.scss'
import { Game } from '@common/types/Game'
import GameTile from '../MediaTile/Presets/GameTile'
import { JsonParam, useQueryParam, withDefault } from 'use-query-params'

interface ActiveCell {
  column: number,
  row: number
}

const GridScroller = ({
  isActive = true,
  elems,
  label,
  onSelect,
  onHighlight,
  id: propsId
}: ScrollerProps<Game>) => {
  const instanceId = useId()
  const id = propsId ?? instanceId

  const [
    {
      ui: {
        grid: { columnCount }
      }
    }
  ] = useAtom(appConfigAtom)

  const rowCount = Math.ceil(elems.length / columnCount)
  const scrollerRef = useRef<VirtuosoGridHandle>(null)

  const [activeCell, setActiveCell] = useQueryParam<ActiveCell, ActiveCell>(
    id,
    withDefault(JsonParam, { row: 0, column: 0 }),
    { updateType: 'replaceIn' }
  )

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
      behavior: 'smooth',
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
          overscan={1000}
          initialTopMostItemIndex={activeIndex}
        />
      </div>
    </div>
  )
}

export default GridScroller
