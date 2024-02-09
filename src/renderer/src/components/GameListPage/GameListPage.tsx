import { Game } from '@common/types'
import GridScroller from '@renderer/components/GridScroller/GridScroller'
import css from './GameListPage.module.scss'
import VerticalGameInfo from '@renderer/components/VerticalGameInfo'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ISortByObjectSorter, sort } from 'fast-sort'

interface Props {
  games: Game[]
  label?: string
}

type SortType = "name"
type SortOrder = "desc" | "asc"

export const GameListPage = ({ games, label }: Props) => {
  const [sortType] = useState<SortType>("name");
  const [sortOrder] = useState<SortOrder>("asc");

  const sortedGames = useMemo(() => (
    sort(games).by(
      { [sortOrder]: (g: Game) => g.name } as unknown as ISortByObjectSorter<Game>
    )
  ), [games, sortType, sortOrder]);

  const [activeGame, setActiveGame] = useState(sortedGames[0]);

  const navigate = useNavigate()

  return (
    <div className={css.container}>
      <div className={css.left}>
        <GridScroller
          elems={sortedGames}
          label={label}
          onSelect={() => navigate(`/game/${activeGame.id}`)}
          onHighlight={setActiveGame}
        />
      </div>
      <div className={css.right}>
        {activeGame && <VerticalGameInfo game={activeGame} className={css.gameView} />}
      </div>
    </div>
  )
}
