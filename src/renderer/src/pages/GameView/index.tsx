import games from "@renderer/atoms/games"
import { Input } from "@renderer/enums";
import { useOnInput } from "@renderer/hooks";
import { useAtom } from "jotai"
import { useLocation } from "wouter";

const GameView = ({ id }: { id: string }) => {
  const [game] = useAtom(games.get(id));

  console.log(game, id)
  const [_, setLocation] = useLocation()

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        return setLocation("/")
    }
  })

  if(!game) return null;
  return (
    <div>
      {game.name}
    </div>
  )
}

export default GameView
