import { Game } from "@renderer/atoms/games"
import GridScroller from "@renderer/components/GridScroller/GridScroller"
import css from "./GameListPage.module.scss"
import VerticalGameInfo from "@renderer/components/VerticalGameInfo"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface Props {
  games: Game[]
  label?: string
}

export const GameListPage = ({ games, label }: Props) => {
  const [activeGame, setActiveGame] = useState(games[0]);

  const navigate = useNavigate();

  return (
    <div className={css.container}>
      <div className={css.left}>
        <GridScroller
          elems={games}
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
