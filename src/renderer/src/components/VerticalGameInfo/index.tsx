import { Game } from "@renderer/atoms/games";
import css from "./VerticalGameInfo.module.scss";
import classNames from "classnames";
import Marquee from "../Marquee";
import MediaImage from "../MediaImage/MediaImage";

interface Props {
  className?: string;
  game: Game
}

const VerticalGameInfo = ({ className, game }: Props) => {
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
    </div>
  );
}

export default VerticalGameInfo;
