import useGamePills from "@renderer/components/Pill/hooks/useGamePills";
import classNames from "classnames";
import css from "./GameInfo.module.scss";
import Pill from "@renderer/components/Pill";
import { TabContentProps } from "@renderer/components/TabSelector/TabSelector";
import Marquee from "@renderer/components/Marquee";

const GameInfo = ({ className, game }: TabContentProps) => {
  const pills = useGamePills(game ?? null);

  if(!game) return null;
  return (
    <div className={classNames(css.container, className)}>
      <div className={css.description}>
        <Marquee className={css.descriptionText}>
          {game.description}
        </Marquee>
      </div>
      <div className={css.pills}>
        {pills && pills.length && pills.map(pill => <Pill
          key={pill.id}
          Icon={pill.Icon}
          label={pill.text}
        />)}
      </div>
    </div>
  )
}

export default GameInfo
