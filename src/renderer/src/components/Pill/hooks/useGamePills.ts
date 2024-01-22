import { Game } from "@common/types";
import systems from "@renderer/atoms/systems";
import { Pill } from "@renderer/components/Showcase";
import { formatDistanceToNowStrict } from "date-fns";
import { useAtom } from "jotai";
import { useMemo } from "react";

import { LuCalendarClock } from "react-icons/lu";
import { MdOutlineCategory, MdOutlinePeopleAlt } from "react-icons/md";
import { GiGameConsole } from "react-icons/gi";

const useGamePills = (game: Game | null) => {
  const [gameSystem] = useAtom(systems.single(game?.system ?? ""));

  const pillElems = useMemo(() => {
    if(!game) return [];
    return [
      {
        text: game.lastPlayed
          ? formatDistanceToNowStrict(new Date(game.lastPlayed), { addSuffix: true })
          : undefined,
        Icon: LuCalendarClock,
        id: `${game.id}-lastPlayed`
      },
      {
        text: game.genre,
        Icon: MdOutlineCategory,
        id: `${game.id}-genre`
      },
      {
        text: game.players,
        Icon: MdOutlinePeopleAlt,
        id: `${game.id}-players`
      },
      {
        text: gameSystem?.name,
        Icon: GiGameConsole,
        id: `${game.id}-system`
      },
    ].filter((elem): elem is Pill => Boolean(elem.text))
  }, [game, gameSystem])

  return pillElems;
}

export default useGamePills;
