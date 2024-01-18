import { ScrollElement } from "@renderer/types";
import { ScrollerProps } from "../Scroller";
import GameTile from "../GameTile/GameTile";
import { useId, useMemo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid as Grid } from "react-window"
import { atom, useAtom } from "jotai";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import { atomFamily } from "jotai/utils";
import uiConfigAtom from "@renderer/atoms/ui";
import Label from "../Label/Label";
import css from "./GridScroller.module.scss"

const activeCellAtom = atomFamily((_id: string) => atom({
  row: 0,
  column: 0
}))

const GameCell = ({ columnIndex, rowIndex, style, data }) => {
  const [activeCell] = useAtom(activeCellAtom(data.instanceId));
  const [{ grid: { columnCount }}] = useAtom(uiConfigAtom);

  const isActive = activeCell.row === rowIndex && activeCell.column === columnIndex;

  const index = (rowIndex * columnCount) + columnIndex;
  const gameData = data.elems[index];

  if(!gameData) return null;

  return (
    <div className={css.tileWrapper} style={style} >
      <GameTile {...gameData} active={isActive} swapTransform={true} className={css.tile} />
    </div>
  )
}

const GridScroller = <T extends ScrollElement>({
  isActive = true,
  elems,
  label,
  onSelect,
  onHighlight
}: ScrollerProps<T>) => {
  const instanceId = useId();

  const [{ grid: { columnCount }}] = useAtom(uiConfigAtom);
  const rowCount = Math.ceil(elems.length / columnCount);

  const itemData = useMemo(() => ({ elems, instanceId }), [elems]);
  const [activeCell, setActiveCell] = useAtom(activeCellAtom(instanceId));

  const activeElem = useMemo(() => {
    const index = (activeCell.row * columnCount) + activeCell.column;
    return elems[index];
  }, [activeCell, elems])

  useOnInput((input) => {
    const newCell = {...activeCell};

    switch(input) {
      case Input.LEFT:
        newCell.column = Math.max(newCell.column - 1, 0);
        break;
      case Input.RIGHT:
        newCell.column = Math.min(newCell.column + 1, columnCount - 1);
        break;
      case Input.UP:
        newCell.row = Math.max(newCell.row - 1, 0);
        break;
      case Input.DOWN:
        newCell.row = Math.min(newCell.row + 1, rowCount - 1);
        break;
      case Input.A:
        return onSelect?.(activeElem)
    }

    let newIndex = (newCell.row * columnCount) + newCell.column;
    const maxIndex = elems.length - 1;

    if(newIndex > maxIndex) {
      const diff = newIndex - maxIndex;

      newCell.row = rowCount - 1;
      newCell.column = newCell.column - diff;

      newIndex = maxIndex;
    }

    onHighlight?.(elems[newIndex]);
    setActiveCell(newCell);
  })

  return (
    <div className={css.container}>
      {label &&
        <Label
          label={label}
          sublabel={isActive ? activeElem?.name : undefined}
          className={css.label}
        />
      }
      <div className={css.gridWrapper}>
        <AutoSizer>
          {({ height, width }) => {
            return <Grid
              height={height}
              width={width}
              className={css.grid}
              columnCount={columnCount}
              rowCount={rowCount}
              itemData={itemData}
              rowHeight={(43 / 92) * ((width / columnCount))}
              columnWidth={width / columnCount}
              ref={(elem) => {
                elem?.scrollToItem({
                  rowIndex: activeCell.row,
                })
              }}
              style={{
                scrollBehavior: "smooth",
              }}
            >
              {GameCell}
            </Grid>
          }}
        </AutoSizer>
      </div>
    </div>
  )
}

export default GridScroller;
