import { RefObject, useEffect } from "react"

export const useShrinkToFit = (ref: RefObject<HTMLDivElement>, scale = 1) => {
  useEffect(() => {
    const transformHandler = () => {
      const elem = ref.current;
      if (!elem) return;

      const parent = elem.parentElement;
      if (!parent) return;

      const elemHeight = elem.scrollHeight;
      const parentHeight = parent.clientHeight * scale;

      const elemWidth = elem.scrollWidth;
      const parentWidth = parent.clientWidth * scale;

      if(elemHeight <= parentHeight && elemWidth <= parentWidth) return;

      const ratio = Math.min(parentHeight / elemHeight, parentWidth / elemWidth);
      elem.style.scale = String(ratio);
    }

    transformHandler();
    window.addEventListener('resize', transformHandler);

    return () => { window.removeEventListener('resize', transformHandler) }
  }, [ref.current])
}
