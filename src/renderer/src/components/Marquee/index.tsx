import { PropsWithChildren, useRef } from "react";

interface Props {
  className?: string
  delay?: number
  velocity?: number
}

const Marquee = ({
  children,
  className,
}: PropsWithChildren<Props>) => {
  const ref = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   const elem = ref.current;
  //   if(!elem) return;

  //   let zeroTime = performance.now();
  //   let localVelocity = velocity;

  //   const getScrollProgress = () => {
  //     const maxScroll = elem.scrollHeight - elem.clientHeight;
  //     const scrollProgress = elem.scrollTop / maxScroll;

  //     return {
  //       maxScroll,
  //       scrollProgress
  //     }
  //   }

  //   const animate = (t: number) => {
  //     const { scrollProgress, maxScroll } = getScrollProgress();

  //     const deltaT = t - zeroTime;
  //     const distance = deltaT * localVelocity;

  //     elem.scrollTop = Math.abs(maxScroll - distance);
  //     requestAnimationFrame(animate)
  //   }

  //   requestAnimationFrame(animate)
  // }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default Marquee
