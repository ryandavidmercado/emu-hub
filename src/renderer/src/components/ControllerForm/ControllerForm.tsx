import { IconType } from "react-icons";
import css from "./ControllerForm.module.scss";
import { CSSProperties, Dispatch, useMemo, useState } from "react";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import classNames from "classnames";
import { Align, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { SetStateAction } from "jotai";

export type ColorScheme = "default" | "caution" | "warning" | "confirm"
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
  setEnabled: Dispatch<SetStateAction<boolean>>
})

interface ItemData {
  entries: ControllerFormEntry[];
  activeIndex: number;
}

interface Props {
  entries: ControllerFormEntry[],
  isActive: boolean
  controlledActiveIndex?: number;
  controlledSetActiveIndex?: Dispatch<SetStateAction<number>>;
  inputPriority?: number;
  autoHeight?: boolean;
  defaultSelection?: string;
  scrollType?: Align
}

const ControllerForm = ({
  entries,
  isActive,
  controlledActiveIndex,
  controlledSetActiveIndex,
  inputPriority,
  autoHeight,
  defaultSelection,
  scrollType
}: Props) => {
  const defaultIndex = entries.findIndex(e => e.id === defaultSelection);
  const [localActiveIndex, localSetActiveIndex] = useState(defaultIndex > -1 ? defaultIndex : 0);

  const activeIndex = controlledActiveIndex ?? localActiveIndex;
  const setActiveIndex = controlledSetActiveIndex ?? localSetActiveIndex;

  const activeEntry = entries[activeIndex];

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

  return (
    <div
      className={css.controllerForm}
      style={{ height: autoHeight ? entries.length * 100 : "100%" }}
    >
      <AutoSizer>
      {({ height, width }) => (
        <List
          className={css.transparentScrollBar}
          itemData={itemData}
          height={Math.min(entries.length * 100, height)}
          width={width}
          itemCount={entries.length}
          itemSize={100}
          ref={(elem) => {
            elem?.scrollToItem(activeIndex, scrollType ?? "auto")
          }}
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
