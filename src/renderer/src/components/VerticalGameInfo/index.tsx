import { Game } from "@renderer/atoms/games";
import css from "./VerticalGameInfo.module.scss";
import classNames from "classnames";
import Marquee from "../Marquee";
import MediaImage from "../MediaImage/MediaImage";
import useGamePills from "../Pill/hooks/useGamePills";
import { useMemo } from "react";
import Pill from "../Pill";

interface Props {
  className?: string;
  game: Game
}

const VerticalGameInfo = ({ className, game }: Props) => {
  const pills = useGamePills(game);
  const pillElements = useMemo(() => (
    pills.map(pill => (
      <Pill
        Icon={pill.Icon}
        key={pill.id}
        label={pill.text}
        className={css.pill}
      />
    ))
  ), [pills])

  return (
    <div className={classNames(css.container, className)}>
      <div className={css.bgAndLogo}>
        <MediaImage className={css.hero} mediaContent={game} mediaType={["screenshot", "hero"]} />
        <MediaImage className={css.logo} mediaContent={game} mediaType="logo" />
      </div>
      <Marquee
        className={css.description}
      >
        {game.description}
      </Marquee>
      {Boolean(pillElements.length) && Boolean(game.description) &&
        <div className={css.pills}>
          {pillElements}
        </div>
      }
    </div>
  );
}

export default VerticalGameInfo;
