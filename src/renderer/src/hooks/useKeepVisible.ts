import { RefObject, useEffect } from "react";
import { ScrollType } from "../enums";

export interface OverrideParentBox {
  right: number,
  left: number,
  bottom: number,
  top: number
}

export const useKeepVisible = (
  ref: RefObject<HTMLDivElement>,
  padding: number = 0,
  scrollType: ScrollType = ScrollType.HORIZONTAL,
  active = true,
  overrideParentBox?: OverrideParentBox
) => {
  useEffect(() => {
    if (!ref.current?.parentElement || !active) return;

    const elementBox = ref.current.getBoundingClientRect();
    const parentBox = (overrideParentBox as DOMRect) ?? ref.current.parentElement.getBoundingClientRect();

    switch (scrollType) {
      case ScrollType.HORIZONTAL:
        handleHorizontal(elementBox, parentBox, ref, padding);
        break;
      case ScrollType.VERTICAL:
        handleVertical(elementBox, parentBox, ref, padding);
        break;
      default:
        break;
    }
  }, [ref.current, padding, scrollType, overrideParentBox])
}

const handleHorizontal = (elementBox: DOMRect, parentBox: DOMRect, elementRef: RefObject<HTMLDivElement>, padding: number) => {
  if (!elementRef.current?.parentElement) return;

  if (elementBox.right > parentBox.right) {
    elementRef.current.parentElement.scrollLeft = elementBox.right - parentBox.right + padding + elementRef.current.parentElement.scrollLeft;
  }
  if (elementBox.left < parentBox.left) {
    elementRef.current.parentElement.scrollLeft = elementBox.left - parentBox.left + elementRef.current.parentElement.scrollLeft - padding;
  }
}

const handleVertical = (elementBox: DOMRect, parentBox: DOMRect, elementRef: RefObject<HTMLDivElement>, padding: number) => {
  if (!elementRef.current?.parentElement) return;

  elementRef.current.parentElement.scrollTop = elementBox.top - parentBox.top + elementRef.current.parentElement.scrollTop - padding;

  // if (elementBox.bottom > parentBox.bottom) {
    // elementRef.current.parentElement.scrollTop = elementBox.bottom - parentBox.bottom + padding + elementRef.current.parentElement.scrollLeft;
  // }
  // if (elementBox.top < parentBox.top) {
  //   elementRef.current.parentElement.scrollTop = elementBox.top - parentBox.top + elementRef.current.parentElement.scrollLeft - padding;
  // }

  // // if ((elementBox.bottom > parentBox.bottom) || (elementBox.top < parentBox.top)) {
  //   elementRef.current.scrollIntoView({
  //     block: "start",
  //   });
  //   return;
  // // }
}
