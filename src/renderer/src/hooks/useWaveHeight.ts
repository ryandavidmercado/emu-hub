import { useEffect, useRef, useState } from 'react'

// allows setting Wavify height as a ratio of the parent element
export const useWaveHeight = (ratio: number) => {
  const [waveHeight, setWaveHeight] = useState(0)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const applyHeight = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (!entry) return

      setWaveHeight(Math.round(entry.target.clientHeight * (1 - ratio)))
    }

    if (!parentRef.current) return
    const observer = new ResizeObserver(applyHeight)
    observer.observe(parentRef.current)

    return () => {
      observer.disconnect()
    }
  }, [ratio])

  return { parentRef, waveHeight }
}
