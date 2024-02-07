import { Game } from '@common/types'
import css from './VerticalGameInfo.module.scss'
import classNames from 'classnames'
import Marquee from '../Marquee'
import useGamePills from '../Pill/hooks/useGamePills'
import { useMemo } from 'react'
import Pill from '../Pill'
import MediaImage from '../MediaImage/MediaImage'

interface Props {
  className?: string
  game: Game
}

const VerticalGameInfo = ({ className, game }: Props) => {
  const pills = useGamePills(game)
  const pillElements = useMemo(
    () =>
      pills.map((pill) => (
        <Pill Icon={pill.Icon} key={pill.id} label={pill.text} className={css.pill} />
      )),
    [pills]
  )

  return (
    <div className={classNames(css.container, className)}>
      <div className={css.bgAndLogo}>
        <MediaImage className={css.hero} media={game.screenshot} />
        <MediaImage className={css.logo} media={game.logo} />
      </div>
      <Marquee className={css.description}>{game.description}</Marquee>
      {Boolean(pillElements.length) && <div className={css.pills}>{pillElements}</div>}
    </div>
  )
}

export default VerticalGameInfo
