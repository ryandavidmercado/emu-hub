import Scrollers from '@renderer/components/Scrollers/Scrollers'
import { TabContentProps } from '@renderer/components/TabSelector/TabSelector'
import { useRecommendationScrollers } from '@renderer/hooks'
import { useNavigate } from 'react-router-dom'
import { Game } from '@common/types'

const Recommendations = ({ game, className, onExitUp, isDisabled }: TabContentProps) => {
  const navigate = useNavigate()
  const onSelectGame = (game: Game) => {
    navigate(`/game/${game.id}`, { replace: true })
  }
  const scrollers = useRecommendationScrollers(game, onSelectGame)

  if (!game) return null
  return (
    <div>
      <Scrollers
        className={className}
        key={`${game.id}-${scrollers.length}`}
        isDisabled={isDisabled}
        onExitUp={onExitUp}
        scrollers={scrollers}
      />
    </div>
  )
}

export default Recommendations
