import games from "@renderer/atoms/games"
import { Showcase } from "@renderer/components/Showcase";
import { Input } from "@renderer/enums";
import { useOnInput } from "@renderer/hooks";
import { useAtom } from "jotai"
import { useLocation } from "wouter";
import css from "./GameView.module.scss"
import IconButtons from "@renderer/components/IconButtons";
import {
  IoPlay,
  IoPlayOutline,
  IoSettings,
  IoSettingsOutline
} from "react-icons/io5"

const GameView = ({ id }: { id: string }) => {
  const [game] = useAtom(games.single(id));
  const [, launchGame] = useAtom(games.launch);

  const [_, setLocation] = useLocation()

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        return setLocation("/")
    }
  })

  if(!game) return null;
  return (
    <div className={css.container}>
      <Showcase content={game} className={css.height100} />
        <IconButtons
          buttons={[
            {
              id: "play",
              label: "Play",
              Icon: IoPlayOutline,
              IconActive: IoPlay,
              onSelect: () => launchGame(game.id),
              iconClassName: css.playIcon
            },
            {
              id: "settings",
              label: "Settings",
              Icon: IoSettingsOutline,
              IconActive: IoSettings
            }
          ]}
        />
    </div>
  )
}

export default GameView
