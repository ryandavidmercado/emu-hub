import systems, { System } from "@renderer/atoms/systems"
import { Scroller } from "@renderer/components/Scroller"
import { useAtom } from "jotai"
import { useOnInput } from "@renderer/hooks"
import { Input } from "@renderer/enums"
import { useLocation } from "wouter"
import games from "@renderer/atoms/games"

interface Props {
  id: System["id"]
}

export const SystemView = ({ id }: Props) => {
  const [gamesList] = useAtom(games.lists.system(id));
  const [system] = useAtom(systems.single(id))
  const [, setLocation] = useLocation();

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        return history.back()
    }
  })

  return (
    <Scroller
      elems={gamesList}
      label={system?.name}
      onSelect={(game) => setLocation(`/game/${game.id}`)}
    />
  )
}
