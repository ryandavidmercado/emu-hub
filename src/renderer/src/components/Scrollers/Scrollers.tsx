import { Dispatch, useId, useRef, useState } from 'react'
import { Scroller, ScrollerProps } from '../Scroller'
import { useKeepVisible, useDeferredValue } from '@renderer/hooks'
import { ScrollType } from '@renderer/enums'
import { System, SystemWithGames } from '@common/types/System'
import { Game } from '@common/types/Game'
import { SetStateAction } from 'jotai'

export type ScrollerConfig<T extends Game | System> = Omit<
  ScrollerProps<T>,
  'isActive' | 'onPrevScroller' | 'onNextScroller'
> & { id: string }
interface Props {
  className?: string
  scrollers: Array<ScrollerConfig<Game> | ScrollerConfig<System> | ScrollerConfig<SystemWithGames>>
  isDisabled?: boolean
  onExitUp?: () => void
  onExitDown?: () => void
  controlledIndex?: {
    index: number
    setIndex: Dispatch<SetStateAction<number>>
  },
  id?: string
}

const Scrollers = ({
  className,
  scrollers,
  isDisabled,
  onExitUp,
  onExitDown,
  controlledIndex,
  id: propsId
}: Props) => {
  const [localActiveIndex, localSetActiveIndex] = useState(0)

  const instanceId = useId()
  const id = propsId ?? instanceId

  const activeIndex = controlledIndex?.index ?? localActiveIndex
  const setActiveIndex = controlledIndex?.setIndex ?? localSetActiveIndex
  const scrollBehavior = useDeferredValue('smooth', 'initial')

  const activeRef = useRef<HTMLDivElement>(null)

  const content = () => {
    const filteredScrollers = scrollers.filter((s) => s.elems.length)

    const onPrevScroller = () => {
      if (activeIndex === 0) return onExitUp?.()
      setActiveIndex((i) => Math.max(0, i - 1))
    }
    const onNextScroller = () => {
      if (activeIndex === filteredScrollers.length - 1) return onExitDown?.()
      setActiveIndex((i) => Math.min(filteredScrollers.length - 1, i + 1))
    }

    return filteredScrollers.map((scroller, i) => (
      <Scroller
        {...(scroller as ScrollerConfig<Game | System>)}
        key={`${scroller.id}-${scroller.elems.length}`}
        isActive={activeIndex === i && !isDisabled}
        onPrevScroller={onPrevScroller}
        onNextScroller={onNextScroller}
        forwardedRef={activeIndex === i ? activeRef : undefined}
        style={i === filteredScrollers.length - 1 ? { marginBottom: '100vh' } : undefined}
        disableInput={isDisabled}
        id={`${id}-${scroller.id}`}
      />
    ))
  }

  useKeepVisible(activeRef, 35, ScrollType.VERTICAL, true)

  return <div className={className} style={{ scrollBehavior }}>{content()}</div>
}

export default Scrollers
