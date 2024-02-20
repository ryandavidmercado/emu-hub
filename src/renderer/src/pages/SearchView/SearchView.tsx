import { useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { useNavigate, useParams } from 'react-router-dom'
import { GameListPage } from '@renderer/components/GameListPage/GameListPage'
import games from '@renderer/atoms/games'

export const SearchView = () => {
  const { searchQuery } = useParams()
  const search = decodeURIComponent(searchQuery ?? '')

  const [searchGames] = useAtom(games.lists.search)
  const gamesList = searchGames(search)

  const navigate = useNavigate()

  useOnInput((input) => {
    switch (input) {
      case Input.B:
        return history.back()
    }
  })

  if (!search) {
    navigate(-1)
    return null
  }

  return <GameListPage games={gamesList} label={`Results for "${search}"`} disableSort={true} id={`search-${search}` }/>
}
