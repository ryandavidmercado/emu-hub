import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { ScrollElement } from "../../types";
import css from "./Scroller.module.scss"
import { useKeepVisible, useOnInput } from "../../hooks"
import { Input, ScrollType } from "../../enums";

export interface ScrollerProps<T extends ScrollElement> {
  aspectRatio?: "landscape" | "square"
  elems: T[],
  label?: string
  isActive?: boolean;
  onHighlight?: (arg0: T) => void;
  onSelect?: (arg0: T) => void;
  onNextScroller?: () => void;
  onPrevScroller?: () => void;
  onActiveChange?: (active: boolean) => void;
}

export const Scroller = <T extends ScrollElement>({
  aspectRatio = "landscape",
  elems,
  label,
  isActive = true,
  onHighlight,
  onSelect,
  onPrevScroller,
  onNextScroller,
  onActiveChange
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
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [playTick] = useSound("/sounds/tick.wav", {
    playbackRate: 3
  });

  const displayElems = elems.map((elem, i) => {
    const elemIsActive = i === activeIndex

    return (
      <div
        className={classNames(css.elem, css[aspectRatio], {
          [css.active]: elemIsActive && isActive,
          [css.noPoster]: !elem.poster
        })}
        key={elem.id}
        ref={elemIsActive ? activeRef : null}
      >
        {elem.poster
          ? <img src={elem.poster} className={css.image} />
          : elem.logo
            ? <img src={elem.logo} className={css.logo} />
            : <div className={css.elemText}>{elem.name ?? elem.id}</div>
        }
      </div>
    )
  })

  useOnInput((input) => {
    if (!isActive) return;

    const handlePrev = () => {
      activeIndex !== 0 && playTick();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    const handleNext = () => {
      activeIndex !== elems.length - 1 && playTick();
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
  });

  useKeepVisible(activeRef, 35, ScrollType.HORIZONTAL, isActive)
  const activeElem = elems[activeIndex];

  return (
    <div
      className={classNames({
        [css.container]: true,
        [css.inActive]: !isActive
      })}
      ref={scrollerRef}
    >
      {label && (
        <div className={css.label}>
          {label}
          {isActive && activeElem.name && <span> - {elems[activeIndex].name}</span>}
        </div>
      )}
      <div className={css.main}>
        {displayElems}
      </div>
    </div>
  )
}
