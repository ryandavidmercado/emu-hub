import systems from '@renderer/atoms/systems'
import { useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import { useNavigate, useParams } from 'react-router-dom'
import { GameListPage } from '@renderer/components/GameListPage/GameListPage'

export const SystemView = () => {
  const { systemId } = useParams()
  const [system] = useAtom(systems.withGames(systemId || ''))

  const navigate = useNavigate()

  useOnInput((input) => {
    switch (input) {
      case Input.B:
        return history.back()
    }
  })

  if (!system) {
    navigate(-1)
    return null
  }

  return <GameListPage games={system.games} label={system.name} id={`system-${systemId}`} />
}
