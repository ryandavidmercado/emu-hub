import { useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { useNavigate } from 'react-router-dom'
import { GameListPage } from '@renderer/components/GameListPage/GameListPage'
import games from '@renderer/atoms/games'

export const AllGames = () => {
  const [gamesList] = useAtom(games.lists.all)

  const navigate = useNavigate()

  useOnInput((input) => {
    switch (input) {
      case Input.B:
        return history.back()
    }
  })

  if (!gamesList.length) {
    navigate(-1)
    return null
  }

  return <GameListPage games={gamesList} label="All Games" id='all-games' />
}
