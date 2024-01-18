import classNames from "classnames";
import { CSSProperties, Ref, useEffect, useRef, useState } from "react";
import { ScrollElement } from "../../types";
import css from "./Scroller.module.scss"
import { useKeepVisible, useOnInput } from "../../hooks"
import { Input, ScrollType } from "../../enums";
import GameTile from "../GameTile/GameTile";
import Label from "../Label/Label";

export interface ScrollerProps<T extends ScrollElement> {
  aspectRatio?: "landscape" | "square"
  style?: CSSProperties;
  elems: T[],
  label?: string
  isActive?: boolean;
  onHighlight?: (arg0: T) => void;
  onSelect?: (arg0: T) => void;
  onNextScroller?: () => void;
  onPrevScroller?: () => void;
  onActiveChange?: (active: boolean) => void;
  forwardedRef?: Ref<HTMLDivElement>
  disableInput?: boolean;
}

export const Scroller = <T extends ScrollElement>({
  aspectRatio = "landscape",
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
  disableInput
}: ScrollerProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    onActiveChange?.(isActive)
  }, [isActive]);

  useEffect(() => {
    if(!isActive) return;
    onHighlight?.(elems[activeIndex])
  }, [activeIndex, isActive]);

  const activeRef = useRef<HTMLDivElement>(null);

  const displayElems = elems.map((elem, i) => {
    const elemIsActive = i === activeIndex

    return (
      <GameTile
        {...elem}
        key={elem.id}
        activeRef={activeRef}
        active={elemIsActive && isActive}
        aspectRatio={aspectRatio}
      />
    )
  })

  useOnInput((input) => {
    const handlePrev = () => {
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    const handleNext = () => {
      setActiveIndex((i) => Math.min(i + 1, elems.length - 1));
    }

    switch (input) {
      case Input.LEFT:
        handlePrev();
        break;
      case Input.RIGHT:
        handleNext();
        break;
      case Input.UP:
        onPrevScroller?.();
        break;
      case Input.DOWN:
        onNextScroller?.();
        break;
      case Input.A:
        onSelect?.(elems[activeIndex]);
        break;
    }
  }, {
    disabled: !isActive || disableInput
  });

  useKeepVisible(activeRef, 35, ScrollType.HORIZONTAL, isActive)

  const activeElem = elems[activeIndex];

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
      <div className={css.main}>
        {displayElems}
      </div>
    </div>
  )
}
