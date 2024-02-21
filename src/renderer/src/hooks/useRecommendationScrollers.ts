import games from '@renderer/atoms/games'
import { Game } from '@common/types'
import { ScrollerConfig } from '@renderer/components/Scrollers/Scrollers'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

type RecommendationType = 'recs-genre' | 'recs-developer' | 'recs-publisher'

export const useRecommendationScrollers = (
  game: Game | undefined,
  onSelectGame?: (game: Game) => void,
  labelMap?: Record<RecommendationType, (content: string | undefined) => string>
) => {
  const [genreElems] = useAtom(
    games.lists.byAttribute({
      limit: 10,
      attribute: 'genre',
      value: game?.genre,
      excludeId: game?.id,
      shuffle: true
    })
  )

  const [developerElems] = useAtom(
    games.lists.byAttribute({
      limit: 10,
      attribute: 'developer',
      value: game?.developer,
      excludeId: game?.id,
      shuffle: true
    })
  )

  const [publisherElems] = useAtom(
    games.lists.byAttribute({
      limit: 10,
      attribute: 'publisher',
      value: game?.publisher,
      excludeId: game?.id,
      shuffle: true
    })
  )

  return useMemo(() => {
    if (!game) return []
    return [
      {
        id: 'recs-genre',
        label: labelMap?.['recs-genre']?.(game.genre) ?? `More In Genre - ${game.genre}`,
        elems: genreElems,
        onSelect: onSelectGame
      },
      {
        id: 'recs-developer',
        label: labelMap?.['recs-developer']?.(game.developer) ?? `More Developed By ${game.developer}`,
        elems: developerElems,
        onSelect: onSelectGame,
        aspectRatio: 'square'
      },
      {
        id: 'recs-publisher',
        label: labelMap?.['recs-publisher']?.(game.publisher) ?? `More Published By ${game.publisher}`,
        elems: publisherElems,
        onSelect: onSelectGame
      }
    ].filter((scroller) => scroller.elems.length) as ScrollerConfig<Game>[]
  }, [genreElems, developerElems, publisherElems])
}
