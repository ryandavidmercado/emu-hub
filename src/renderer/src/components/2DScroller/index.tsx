import classNames from "classnames";
import { useRef } from "react";
import useSound from "use-sound";
import { ScrollElement } from "../../types";
import css from "./Scroller.module.css"
import { useKeepVisible, useOnInput } from "../../hooks"
import { Input, ScrollType } from "../../enums";

interface ScrollerProps {
  elems: ScrollElement[],
  activeElem: ScrollElement['id'],
  setActiveElem: React.Dispatch<React.SetStateAction<ScrollElement['id']>>
  label?: string
  scrollType?: ScrollType.HORIZONTAL | ScrollType.VERTICAL
}

export const Scroller: React.FC<ScrollerProps> = ({
  elems,
  activeElem,
  setActiveElem,
  label,
  scrollType = ScrollType.HORIZONTAL
}) => {
  const activeRef = useRef<HTMLDivElement>(null);
  const [playTick] = useSound("/sounds/tick.wav", {
    playbackRate: 3
  });
  const [playError] = useSound("/sounds/rick.wav", {
    playbackRate: 1
  });
  const [playClick] = useSound("/sounds/sick.wav")

  const displayElems = elems.map(elem => {
    const isActive = elem.id === activeElem

    return (
      <div
        className={classNames(css.elem, { [css.active]: isActive })}
        ref={isActive ? activeRef : null}
      >
        <img src={elem.poster} className={css.image} />
      </div>
    )
  })

  useOnInput((input) => {
    const currentElem = elems.findIndex(({ id }) => id === activeElem)

    switch (input) {
      case Input.LEFT:
        currentElem === 0 ? playError() : playTick()
        setActiveElem(() => elems[Math.max(currentElem - 1, 0)].id);
        break;
      case Input.RIGHT:
        currentElem === elems.length - 1 ? playError() : playTick();
        setActiveElem(() => elems[Math.min(currentElem + 1, elems.length - 1)].id)
        break;
      case Input.A:
        playClick();
        break;
    }
  });

  useKeepVisible(activeRef, 35, scrollType)

  return (
    <div className={css.container}>
      {label && (
        <div className={css.label}>{label}</div>
      )}
      <div className={css.main}>
        {displayElems}
      </div>
    </div>
  )
}
