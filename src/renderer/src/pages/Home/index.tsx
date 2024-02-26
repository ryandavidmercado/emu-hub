import { useCallback, useMemo, useState } from 'react'
import { Showcase, ShowcaseContent } from '../../components/Showcase'
import css from './Home.module.scss'
import { atom, useAtomValue } from 'jotai'
import games from '@renderer/atoms/games'
import { Game, SystemWithGames } from '@common/types'
import systems from '@renderer/atoms/systems'
import Scrollers, { ScrollerConfig } from '@renderer/components/Scrollers/Scrollers'
import useGamePills from '@renderer/components/Pill/hooks/useGamePills'
import { useNavigate } from 'react-router-dom'
import collections from '@renderer/atoms/collections'
import { getGameShowcaseConfig } from '@renderer/components/Showcase/presets/game'
import { getSystemShowcaseConfig } from '@renderer/components/Showcase/presets/system'
import classNames from 'classnames'
import { useIndexParam } from '@renderer/util/queryParams/IndexParam'
import { ControllerHint, useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'

export const homeScrollersIdAtom = atom(String(Math.random()))

export const Home = () => {
  const scrollersId = useAtomValue(homeScrollersIdAtom)

  const systemsList = useAtomValue(systems.lists.onlyWithGames)
  const recentlyPlayedGamesList = useAtomValue(games.lists.recentlyPlayed)
  const recentlyAddedGamesList = useAtomValue(games.lists.recentlyAdded)
  const collectionsList = useAtomValue(collections.lists.withGames)

  const recommendations = useAtomValue(games.lists.recommended({ excludedRecentlyPlayed: true }))

  const [currentContent, setCurrentContent] = useState<
    { type: 'game'; data: Game } | { type: 'system'; data: SystemWithGames }
  >()

  const gamePills = useGamePills(currentContent?.type === 'game' ? currentContent.data : null)

  const navigate = useNavigate()

  const onGameSelect = useCallback((game: Game) => {
    navigate(`/game/${game.id}`)
  }, [])

  const onGameHighlight = useCallback((game: Game) => {
    setCurrentContent({
      type: 'game',
      data: game
    })
  }, [])

  const showcaseContent: ShowcaseContent = (() => {
    if (!currentContent) return {}
    switch (currentContent.type) {
      case 'game':
        return getGameShowcaseConfig(currentContent.data, gamePills)
      case 'system':
        return getSystemShowcaseConfig(currentContent.data)
    }
  })()

  const unfilteredScrollers = useMemo(
    () => [
      {
        id: 'continue-playing',
        elems: recentlyPlayedGamesList,
        label: 'Continue Playing',
        onHighlight: onGameHighlight,
        onSelect: onGameSelect
      } as ScrollerConfig<Game>,
      {
        id: 'recommended-games',
        elems: recommendations[0]?.games ?? [],
        label: recommendations[0]?.label,
        onHighlight: onGameHighlight,
        onSelect: onGameSelect
      } as ScrollerConfig<Game>,
      {
        id: 'recently-added',
        elems: recentlyAddedGamesList,
        label: 'Recently Added',
        onHighlight: onGameHighlight,
        onSelect: onGameSelect
      } as ScrollerConfig<Game>,
      {
        id: 'systems',
        elems: systemsList,
        label: 'Systems',
        aspectRatio: 'square',
        onHighlight: (system) => {
          setCurrentContent({
            type: 'system',
            data: system
          })
        },
        onSelect: (system) => {
          navigate(`/system/${system.id}`)
        },
        contentType: 'system'
      } as ScrollerConfig<SystemWithGames>,
      ...(collectionsList.map((collection) => ({
        id: `collection-${collection.id}`,
        elems: collection.games,
        label: collection.name,
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
        aspectRatio: collection.games.length < 5 ? ('landscape' as const) : ('square' as const)
      })) as ScrollerConfig<Game>[])
    ],
    [
      recentlyPlayedGamesList,
      recentlyAddedGamesList,
      systemsList,
      collectionsList,
      recommendations
    ]
  )

  const scrollers = useMemo(() => unfilteredScrollers.filter(s => s.elems?.length), [unfilteredScrollers])

  const [scrollerIndex, setScrollerIndex] = useIndexParam(`home-scrollers-index-${scrollersId}`, scrollers.length)
  const collectionsIndex = scrollers.findIndex(s => s.id.startsWith('collection'))

  useOnInput((input) => {
    switch(input) {
      case Input.Y: {
        if(collectionsIndex === -1) return
        if(scrollerIndex >= collectionsIndex) return

        setScrollerIndex(collectionsIndex)
      }
    }
  },
  {
    hints: [
      collectionsIndex !== -1 && scrollerIndex < collectionsIndex && { input: Input.Y, text: 'Jump to Collections' }
    ].filter(Boolean) as ControllerHint[]
  })

  return (
    <div className={css.landing}>
      <Showcase
        className={classNames(css.showcase, scrollerIndex !== 0 && css.shadowLong)}
        content={showcaseContent}
      />
      <Scrollers
        scrollers={scrollers}
        className={css.scrollers}
        key={scrollers.length}
        controlledIndex={{ index: scrollerIndex, setIndex: setScrollerIndex }}
        id={`home-scrollers-${scrollersId}`}
      />
    </div>
  )
}
