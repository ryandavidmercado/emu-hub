import { useMemo, useState } from "react";
import { Scroller, ScrollerProps } from "../Scroller"
import { ScrollElement } from "@renderer/types";

export type ScrollerConfig<T extends ScrollElement> = Omit<ScrollerProps<T>, "isActive" | "onPrevScroller" | "onNextScroller"> & { id: string }
interface Props {
  scrollers: ScrollerConfig<any>[]
}

const Scrollers = ({ scrollers }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const content = useMemo(() => {
    const filteredScrollers = scrollers.filter(s => s.elems.length)

    const onPrevScroller = () => setActiveIndex(i => Math.max(0, i - 1));
    const onNextScroller = () => setActiveIndex(i => Math.min(filteredScrollers.length - 1, i + 1));

    return filteredScrollers.map((scroller, i) => (
      <Scroller
        key={scroller.id}
        {...scroller}
        isActive={activeIndex === i}
        onPrevScroller={onPrevScroller}
        onNextScroller={onNextScroller}
      />
    ))
  }, [activeIndex, setActiveIndex, scrollers]);

  return (
    <div>
      {content}
    </div>
  )
}

export default Scrollers;
