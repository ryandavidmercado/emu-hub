import { IconType } from "react-icons";
import css from "./ControllerForm.module.scss";
import { CSSProperties, Dispatch, useCallback, useMemo, useState } from "react";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import classNames from "classnames";
import { Align, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import type { SetStateAction } from "react";
import { motion } from "framer-motion";
import { useInputModal } from "../InputModal/InputModal";
import { FaCaretLeft, FaCaretRight, FaRegKeyboard } from "react-icons/fa";
import { useConfirmation } from "../ConfirmationModal/ConfirmationModal";

export type ColorScheme = "default" | "caution" | "warning" | "confirm"

export type FormTypes = ({
  type: "action",
  onSelect: (id: string) => void,
  confirmation?: {
    text: string,
    defaultToConfirmed?: boolean
  }
} | {
  type: "toggle",
  enabled: boolean,
  setEnabled: Dispatch<SetStateAction<boolean>>,
  useDisableStyling?: boolean
} | {
  type: "input",
  defaultValue?: string;
  inputLabel?: string;
  isPassword?: boolean;
  onInput: (input: string) => void
  hideFormWhileActive?: boolean
  inputStyle?: CSSProperties;
} | {
  type: "number",
  defaultValue: number;
  onNumber?: (number: number) => void
  min?: number;
  max?: number;
})

export type ControllerFormEntry = {
  id: string,
  label: string,
  sublabel?: string
  Icon?: IconType
  IconActive?: IconType
  colorScheme?: ColorScheme,
} & FormTypes

interface ItemData {
  entries: ControllerFormEntry[];
  activeIndex: number;
  activeNumberInput: string;
  clearActiveNumberInput: () => void;
  inputPriority: number;
  nextInput: () => void;
  prevInput: () => void;
}

interface Props {
  entries: ControllerFormEntry[],
  isActive: boolean
  controlledActiveIndex?: number;
  controlledSetActiveIndex?: Dispatch<SetStateAction<number>>;
  inputPriority?: number;
  maxHeight?: string;
  defaultSelection?: string;
  scrollType?: Align
  hasParentContainer?: boolean
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
}: Props) => {
  const defaultIndex = entries.findIndex(e => e.id === defaultSelection);
  const [localActiveIndex, localSetActiveIndex] = useState(defaultIndex > -1 ? defaultIndex : 0);

  const activeIndex = controlledActiveIndex ?? localActiveIndex;
  const setActiveIndex = controlledSetActiveIndex ?? localSetActiveIndex;

  const activeEntry = entries[activeIndex];

  const [hiddenForInput, setHiddenForInput] = useState(false);
  const [activeNumberInput, setActiveNumberInput] = useState("");

  const getInput = useInputModal();
  const getConfirmation = useConfirmation();

  const onSelect = async () => {
    switch (activeEntry.type) {
      case "action":
        if(activeEntry.confirmation) {
          const confirmed = await getConfirmation(activeEntry.confirmation);
          if(!confirmed) return;
        }

        activeEntry.onSelect(activeEntry.id);
        break;
      case "toggle":
        activeEntry.setEnabled(e => !e)
        break;
      case "input":
        if(activeEntry.hideFormWhileActive) setHiddenForInput(true);

        const newValue = await getInput({
          label: activeEntry.inputLabel ?? activeEntry.label,
          defaultValue: activeEntry.defaultValue,
          isPassword: activeEntry.isPassword,
          style: activeEntry.inputStyle
        })

        setHiddenForInput(false);
        if(!newValue) return;
        activeEntry.onInput(newValue);
        break;
      case "number":
        setActiveNumberInput(activeEntry.id);
        break;
    }
  }

  const prevInput = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0))
  }, [])

  const nextInput = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, entries.length - 1))
  }, [])

  useOnInput((input) => {
    switch (input) {
      case Input.A:
        onSelect();
        break;
      case Input.DOWN:
        nextInput();
        break;
      case Input.UP:
        prevInput();
        break;
    }
  }, {
    disabled: !isActive,
    priority: inputPriority
  })

  const itemData = useMemo<ItemData>(() => ({
    entries,
    activeIndex,
    activeNumberInput,
    inputPriority: inputPriority ?? 0,
    clearActiveNumberInput: () => { setActiveNumberInput("") },
    nextInput,
    prevInput
  }), [entries, activeIndex, activeNumberInput, inputPriority, nextInput, prevInput])

  if(hiddenForInput) return null;
  return (
    <div
      className={css.controllerForm}
      style={{ height: (() => {
        const entriesHeight = entries.length * 100;
        if(maxHeight) return `min(${entriesHeight}px, ${maxHeight})`
        if(hasParentContainer) return `min(${entriesHeight}px, 100%)`;
        return entriesHeight;
      })()}}
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
          useDisableStyling={entry.useDisableStyling}
        />
      }
      {entry.type === "number" &&
        <NumberDisplay
          value={entry.defaultValue ?? 0}
          min={entry.min}
          max={entry.max}
          active={data.activeNumberInput === entry.id}
          inputPriority={data.inputPriority + 1}
          onExit={data.clearActiveNumberInput}
          onNumber={entry.onNumber}
          nextInput={data.nextInput}
          prevInput={data.prevInput}
        />
      }
      {
        (() => {
          const defaultIcons: Partial<Record<FormTypes["type"], IconType>> = {
            "input": FaRegKeyboard
          }

          const IconElem = (
            isActive
              ? (entry.IconActive ?? entry.Icon)
              : entry.Icon
          ) ?? defaultIcons[entry.type]

          return IconElem ? <IconElem /> : null;
        })()
      }
    </div>
  )
}

const Toggle = ({ active, enabled, useDisableStyling = true }: { active: boolean, enabled: boolean, useDisableStyling }) => {
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
          (enabled || !useDisableStyling) && css.enabled
        )}
      />
    </motion.div>
  )
}

interface NumberDisplayProps {
  value: number
  min?: number
  max?: number
  inputPriority: number
  active?: boolean
  onExit: () => void
  onNumber?: (number: number) => void
  nextInput: () => void;
  prevInput: () => void;
}

const NumberDisplay = ({ active, value, min, max, inputPriority, onExit, onNumber, nextInput, prevInput }: NumberDisplayProps) => {
  useOnInput((input) => {
    switch(input) {
      case Input.DOWN:
        nextInput();
        onExit();
        break;
      case Input.UP:
        prevInput();
        onExit();
        break;
      case Input.LEFT:
        onNumber?.(Math.max(value - 1, min ?? 0));
        break;
      case Input.RIGHT:
        onNumber?.(Math.min(value + 1, max ?? Infinity));
        break;
      case Input.A:
      case Input.B:
        onExit()
    }
  }, {
    disabled: !active,
    priority: inputPriority
  })

  return (
    <div className={classNames(css.numberDisplay, active && css.active)}>
      <FaCaretLeft />
        <div>{value}</div>
      <FaCaretRight />
    </div>
  )
}

export default ControllerForm
