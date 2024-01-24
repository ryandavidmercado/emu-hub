import { useMemo, useRef, useState } from "react";
import { Scroller, ScrollerProps } from "../Scroller"
import { useKeepVisible } from "@renderer/hooks";
import { ScrollType } from "@renderer/enums";
import { System, SystemWithGames } from "@common/types/System";
import { Game } from "@common/types/Game";

export type ScrollerConfig<T extends Game | System> = Omit<ScrollerProps<T>, "isActive" | "onPrevScroller" | "onNextScroller"> & { id: string }
interface Props {
  className?: string;
  scrollers: Array<ScrollerConfig<Game> | ScrollerConfig<System> | ScrollerConfig<SystemWithGames>>;
  isDisabled?: boolean;
  onExitUp?: () => void;
  onExitDown?: () => void;
}

const Scrollers = ({ className, scrollers, isDisabled, onExitUp, onExitDown }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    const filteredScrollers = scrollers.filter(s => s.elems.length)

    const onPrevScroller = () => {
      if(activeIndex === 0) return onExitUp?.();
      setActiveIndex(i => Math.max(0, i - 1));
    }
    const onNextScroller = () => {
      if(activeIndex === filteredScrollers.length - 1) return onExitDown?.();
      setActiveIndex(i => Math.min(filteredScrollers.length - 1, i + 1));
    }

    return filteredScrollers.map((scroller, i) => (
      <Scroller
        {...scroller as ScrollerConfig<Game | System>}
        key={`${scroller.id}-${scroller.elems.length}`}
        isActive={activeIndex === i && !isDisabled}
        onPrevScroller={onPrevScroller}
        onNextScroller={onNextScroller}
        forwardedRef={(activeIndex === i) ? activeRef : undefined}
        style={(i === filteredScrollers.length - 1) ? { marginBottom: "100vh"} : undefined}
        disableInput={isDisabled}
      />
    ))
  }, [activeIndex, setActiveIndex, scrollers, isDisabled, onExitUp, onExitDown]);

  useKeepVisible(activeRef, 35, ScrollType.VERTICAL, true)

  return (
    <div
      className={className}
    >
      {content}
    </div>
  )
}

export default Scrollers;
