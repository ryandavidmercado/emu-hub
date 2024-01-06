import { useMemo, useState } from "react";
import { Showcase, ShowcaseContent } from "../../components/Showcase"
import css from "./Landing.module.css"
import { useAtom } from "jotai";
import games, { Game } from "@renderer/atoms/games";
import systems, { System } from "@renderer/atoms/systems";
import Scrollers, { ScrollerConfig } from "@renderer/components/Scrollers/Scrollers";
import { useLocation } from "wouter";

export const Landing = () => {
  const [gamesList] = useAtom(games.lists.all);
  const [recentGamesList] = useAtom(games.lists.recents);
  const [systemsList] = useAtom(systems.lists.all);

  const [currentContent, setCurrentContent] = useState<ShowcaseContent | null>(null);

  const [_, setLocation] = useLocation();

  const scrollers = useMemo(() => {
    return [
      {
        id: "recent-games",
        elems: recentGamesList,
        label: "Recent Games",
        onHighlight: setCurrentContent,
        onSelect: (game) => { setLocation(`/game/${game.id}`) },
      } as ScrollerConfig<Game>,
      {
        id: "systems",
        elems: systemsList,
        label: "Systems",
        aspectRatio: "square",
        onHighlight: setCurrentContent,
        onSelect: (system) => { setLocation(`/system/${system.id}`) }
     }  as ScrollerConfig<System>
    ]
  }, [gamesList, recentGamesList, setCurrentContent, systemsList]);

  return (
    <div className={css.landing}>
      <Showcase content={currentContent} />
      <Scrollers scrollers={scrollers} />
    </div>
  )
}
