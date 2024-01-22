import games from "@renderer/atoms/games"
import { Game } from "@common/types"
import { ScrollerConfig } from "@renderer/components/Scrollers/Scrollers"
import { useAtom } from "jotai"
import { useMemo } from "react"

export const useRecommendationScrollers = (game: Game | undefined, onSelectGame?: (game: Game) => void) => {
  const [genreElems] = useAtom(games.lists.byAttribute({
    limit: 10,
    attribute: "genre",
    value: game?.genre,
    excludeId: game?.id
  }))

  const [developerElems] = useAtom(games.lists.byAttribute({
    limit: 10,
    attribute: "developer",
    value: game?.developer,
    excludeId: game?.id
  }))

  const [publisherElems] = useAtom(games.lists.byAttribute({
    limit: 10,
    attribute: "publisher",
    value: game?.publisher,
    excludeId: game?.id
  }))

  return useMemo(() => {
    if(!game) return [];
    return [
      {
        id: "recs-genre",
        label: `More In Genre - ${game.genre}`,
        elems: genreElems,
        onSelect: onSelectGame
      },
      {
        id: "recs-developer",
        label: `More Developed By ${game.developer}`,
        elems: developerElems,
        onSelect: onSelectGame,
        aspectRatio: "square"
      },
      {
        id: "recs-publisher",
        label: `More Published By ${game.publisher}`,
        elems: publisherElems,
        onSelect: onSelectGame
      }
    ].filter(scroller => scroller.elems.length) as ScrollerConfig<Game>[]
  }, [genreElems, developerElems, publisherElems])
}
