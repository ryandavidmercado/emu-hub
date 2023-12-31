import { RefObject, useEffect } from "react";

// returns a number from 0-1 indicating scroll progress
const getScrollProgress = (
  elem: HTMLElement,
  dir: "horizontal" | "vertical"
) => {
  const elemProps = {
    scrollLength: {
      horizontal: "scrollWidth",
      vertical: "scrollHeight",
    },
    clientLength: {
      horizontal: "clientWidth",
      vertical: "clientHeight",
    },
    scrolledLength: {
      horizontal: "scrollLeft",
      vertical: "scrollTop",
    },
  } as const;

  const scrollLength = elem[elemProps.scrollLength[dir]];
  const clientLength = elem[elemProps.clientLength[dir]];
  const scrolledLength = elem[elemProps.scrolledLength[dir]];

  const maxScroll = scrollLength - clientLength;
  const progress = scrolledLength / maxScroll;

  // round to 2 digits
  return Math.round(progress * 100) / 100;
};

const maskStyle = (dir: "horizontal" | "vertical", scrollProgress: number) => {
  const gradientDirection = (
    {
      horizontal: "right",
      vertical: "bottom",
    } as const
  )[dir];

  return `
    linear-gradient(
      to ${gradientDirection},
      rgba(0, 0, 0, ${1 - scrollProgress}) 0%,
      #000 20%,
      #000 80%,
      rgba(0, 0, 0, ${scrollProgress}) 100%
    )
  `;
};

export const scrollHandler = (dir: "horizontal" | "vertical") => (e: Event) => {
  console.log("used")
  const elem = e.currentTarget as HTMLElement;
  elem.style.mask = maskStyle(dir, getScrollProgress(elem, dir));
};


export const useScrollEdgeFade = (
  ref: RefObject<HTMLElement>,
  dir: "horizontal" | "vertical",
  enabled = true
) => {
  useEffect(() => {
    const elem = ref.current;
    if (!elem || !enabled) return;

    const localScrollHandler = scrollHandler(dir);

    localScrollHandler({ currentTarget: elem } as unknown as Event);
    elem.addEventListener("scroll", localScrollHandler);

    return () => {
      elem.removeEventListener("scroll", localScrollHandler);
      elem.style.mask = "";
    };
  }, [enabled, dir, ref]);

}
