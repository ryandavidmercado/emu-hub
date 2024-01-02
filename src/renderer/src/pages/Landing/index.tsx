import { useCallback, useMemo, useState } from "react";
import { MainContainer } from "../../components/MainContainer";
import { Showcase, ShowcaseContent } from "../../components/Showcase"
import css from "./Landing.module.css"
import { useAtom } from "jotai";
import games, { Game } from "@renderer/atoms/games";
import { System, systemsAtom } from "@renderer/atoms/systems";
import Scrollers, { ScrollerConfig } from "@renderer/components/Scrollers/Scrollers";
import { ScrollElement } from "@renderer/types";

export const Landing = () => {
  const [gamesList] = useAtom(games.lists.all);
  const [recentGamesList] = useAtom(games.lists.recents);

  const [, updateGame] = useAtom(games.update);
  const [launchGame] = useAtom(games.launch);

  const [systems] = useAtom(systemsAtom);

  const [currentContent, setCurrentContent] = useState<ShowcaseContent | null>(null);

  const onGameSelect = useCallback((game: Game) => {
    try {
      updateGame(game.id, { lastPlayed: new Date().toUTCString() });
      launchGame(game.id);
    } catch(e) {
      console.error(e)
    }
  }, [updateGame, launchGame])

  const scrollers = useMemo(() => {
    return [
      {
        id: "all-games",
        label: "All Games",
        elems: gamesList,
        onHighlight: setCurrentContent,
        onSelect: onGameSelect as (content: ScrollElement) => void,
      } as ScrollerConfig<Game>,
      {
        id: "recent-games",
        elems: recentGamesList,
        label: "Recent Games",
        onHighlight: setCurrentContent
      } as ScrollerConfig<Game>,
      {
        id: "systems",
        elems: systems,
        label: "Systems",
        aspectRatio: "square",
        onHighlight: setCurrentContent,
      }  as ScrollerConfig<System>
    ]
  }, [gamesList, onGameSelect, recentGamesList, setCurrentContent, systems]);

  return (
    <div className={css.landing}>
      {currentContent && <Showcase content={currentContent} />}
      <MainContainer>
        <Scrollers scrollers={scrollers} />
      </MainContainer>
    </div>
  )
}
