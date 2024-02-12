import { Game } from '@common/types'
import GridScroller from '@renderer/components/GridScroller/GridScroller'
import css from './GameListPage.module.scss'
import VerticalGameInfo from '@renderer/components/VerticalGameInfo'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ISortByObjectSorter, sort } from 'fast-sort'
import { useAtom } from 'jotai'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import { hintsHeight } from '@renderer/const/const'
import { useOnInput } from '@renderer/hooks/useOnInput'
import { Input } from '@renderer/enums'

interface Props {
  games: Game[]
  label?: string
  disableSort?: boolean
}

type SortType = "name"
type SortOrder = "desc" | "asc"

export const GameListPage = ({ games, label, disableSort }: Props) => {
  const [sortType] = useState<SortType>("name");
  const [sortOrder] = useState<SortOrder>("asc");

  const [appConfig] = useAtom(appConfigAtom)
  const { ui: { controllerHints }} = appConfig

  const sortedGames = useMemo(() => (
    disableSort
      ? games
      : sort(games).by(
          { [sortOrder]: (g: Game) => g.name } as unknown as ISortByObjectSorter<Game>
        )
  ), [games, sortType, sortOrder]);

  const [activeGame, setActiveGame] = useState(sortedGames[0]);
  const navigate = useNavigate()

  // easier to drop the hint here than to include in every GameListPage route
  useOnInput(() => {}, {
    hints: [
      { input: Input.B, text: "Back" }
    ]
  })

  return (
    <div
      className={css.container}
      style={{
        paddingBottom: controllerHints ? hintsHeight : undefined
      }}
    >
      <div
        className={css.left}
        style={{
          paddingBottom: controllerHints ? 0 : undefined
        }}
      >
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
