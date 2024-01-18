import { Game } from "@renderer/atoms/games";
import classNames from "classnames";
import css from "./GameLogo.module.scss"
import MediaImage from "../MediaImage/MediaImage";

interface Props {
  game: Pick<Game, "logo" | "name"> & { romname?: string },
  className?: string
  textClassName?: string
  imgClassName?: string
}
const GameLogo = ({ game, className, textClassName, imgClassName }: Props) => {
  const { name, romname } = game;

  return (
    <MediaImage
      mediaType="logo"
      mediaContent={game}
      className={classNames(imgClassName, className)}
    >
      <div className={classNames(textClassName, className, css.text)}>
        {
          name
            ? name
            : romname
              ? window.path.parse(romname!).name
              : ""
        }
      </div>
    </MediaImage>
  )
}

export default GameLogo
