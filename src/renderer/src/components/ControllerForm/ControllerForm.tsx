import { IconType } from "react-icons";
import css from "./ControllerForm.module.scss";
import { CSSProperties, Dispatch, useMemo, useState } from "react";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import classNames from "classnames";
import { Align, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import type { SetStateAction } from "react";
import { motion } from "framer-motion";
import { useInputModal } from "../InputModal/InputModal";
import { FaRegKeyboard } from "react-icons/fa";

export type ColorScheme = "default" | "caution" | "warning" | "confirm"

export type FormTypes = ({
  type: "action",
  onSelect: (id: string) => void
} | {
  type: "toggle"
  enabled: boolean,
  setEnabled: Dispatch<SetStateAction<boolean>>
} | {
  type: "input",
  defaultValue?: string;
  inputLabel?: string;
  isPassword?: boolean;
  onInput: (input: string) => void
})

export type ControllerFormEntry = {
  id: string,
  label: string,
  sublabel?: string
  Icon?: IconType
  IconActive?: IconType
  colorScheme?: ColorScheme
} & FormTypes

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
  const getInput = useInputModal();

  const onSelect = async () => {
    switch (activeEntry.type) {
      case "action":
        activeEntry.onSelect(activeEntry.id);
        break;
      case "toggle":
        activeEntry.setEnabled(e => !e)
        break;
      case "input":
        const newValue = await getInput({
          label: activeEntry.inputLabel ?? activeEntry.label,
          defaultValue: activeEntry.defaultValue,
          isPassword: activeEntry.isPassword
        })

        if(!newValue) return;
        activeEntry.onInput(newValue);
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
        <Toggle
          active={isActive}
          enabled={entry.enabled}
        />
      }
      {
        (() => {
          const defaultIcons: Partial<Record<FormTypes["type"], IconType>> = {
            "input": FaRegKeyboard
          }

          const IconElem = (isActive
            ? entry.IconActive ?? entry.Icon
            : entry.Icon) ?? defaultIcons[entry.type]

          return IconElem ? <IconElem /> : null;
        })()
      }
    </div>
  )
}

const Toggle = ({ active, enabled }: { active: boolean, enabled: boolean }) => {
  return (
    <motion.div
      className={classNames(
        css.toggleOuter,
        active && css.active,
        enabled && css.enabled
      )}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          mass: .2,
          damping: 12,
          stiffness: 180
        }}
        className={classNames(
          css.toggleInner,
          enabled && css.enabled
        )}
      />
    </motion.div>
  )
}

export default ControllerForm
