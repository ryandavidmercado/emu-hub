import { Game } from "@renderer/atoms/games";
import classNames from "classnames";
import css from "./GameLogo.module.scss"

interface Props {
  game: Pick<Game, "logo" | "name"> & { romname?: string },
  className?: string
  textClassName?: string
  imgClassName?: string
}
const GameLogo = ({ game, className, textClassName, imgClassName }: Props) => {
  const { logo, name, romname } = game;

  if(logo) return <img src={logo} className={classNames(imgClassName, className)} />
  return (
    <div className={classNames(textClassName, className, css.text)}>
      {
        name
          ? name
          : romname
            ? window.path.parse(romname!).name
            : ""
      }
    </div>
  )
}

export default GameLogo
