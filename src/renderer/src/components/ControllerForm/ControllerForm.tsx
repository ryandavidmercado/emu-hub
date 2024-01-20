import { IconType } from "react-icons"
import css from "./ControllerForm.module.scss";
import { CSSProperties, Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import classNames from "classnames";
import { FixedSizeList, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { SetStateAction } from "jotai";

type ColorScheme = "default" | "caution" | "warning" | "confirm"
export type ControllerFormEntry = {
  id: string,
  label: string,
  sublabel?: string
  Icon?: IconType
  IconActive?: IconType
  colorScheme?: ColorScheme
} & ({
  type: "action",
  onSelect: (id: string) => void
} | {
  type: "toggle"
  enabled: boolean,
  setEnabled: (enabled: boolean) => void
})

interface ItemData {
  entries: ControllerFormEntry[];
  activeIndex: number;
}

interface Props {
  entries: ControllerFormEntry[],
  isActive: boolean
  controlledActiveIndex?: number;
  controlledSetActiveIndex?: Dispatch<SetStateAction<number>>
  inputPriority?: number
}

const ControllerForm = ({ entries, isActive, controlledActiveIndex, controlledSetActiveIndex, inputPriority }: Props) => {
  const [localActiveIndex, localSetActiveIndex] = useState(0);

  const activeIndex = controlledActiveIndex ?? localActiveIndex;
  const setActiveIndex = controlledSetActiveIndex ?? localSetActiveIndex;

  const activeEntry = entries[activeIndex];
  const scrollerRef = useRef<FixedSizeList>(null);

  const onSelect = () => {
    switch (activeEntry.type) {
      case "action":
        activeEntry.onSelect(activeEntry.id);
        break;
      case "toggle":
        break;
    }
  }

  useOnInput((input) => {
    switch (input) {
      case Input.A:
        onSelect();
        break;
      case Input.DOWN:
        setActiveIndex((i) => Math.min(i + 1, entries.length - 1))
        break;
      case Input.UP:
        setActiveIndex((i) => Math.max(i - 1, 0))
        break;
    }
  }, {
    disabled: !isActive,
    priority: inputPriority
  })

  const itemData = useMemo<ItemData>(() => ({
    entries, activeIndex
  }), [entries, activeIndex])

  useEffect(() => {
    const scroller = scrollerRef.current;
    if(!scroller) return;
    scroller.scrollToItem(activeIndex, "center");
  }, [activeIndex])

  return (
    <div className={css.controllerForm}>
      <AutoSizer>
      {({ height, width }) => (
        <List
          className={css.transparentScrollBar}
          itemData={itemData}
          height={Math.min(entries.length * 100, height)}
          width={width}
          itemCount={entries.length}
          itemSize={100}
          ref={scrollerRef}
          style={{
            scrollBehavior: "smooth"
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
  style: CSSProperties;
  data: ItemData;
  index: number;
}

const ListEntry = ({ index, style, data }: ListEntryProps) => {
  const { entries, activeIndex } = data;
  const entry = entries[index];

  const isActive = index === activeIndex;

  return (
    <div key={entry.id} className={classNames(
      css.entry,
      (index === activeIndex) && css.active,
      css[entry.colorScheme ?? "default"]
    )} style={style}>
      <div className={css.left}>
        <div>{entry.label}</div>
        {entry.sublabel &&
          <div className={classNames(css.sublabel, isActive && css.active)}>
            {entry.sublabel}
          </div>
        }
      </div>
      {entry.type === "toggle" &&
        <Toggle />
      }
      {
        (() => {
          const Elem = isActive
            ? entry.IconActive ?? entry.Icon
            : entry.Icon

          return Elem ? <Elem /> : null;
        })()
      }
    </div>
  )
}

const Toggle = () => {
  return (
    <div>"toggle"</div>
  )
}

export default ControllerForm
