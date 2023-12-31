import { useCallback, useMemo, useState } from "react";
import { MainContainer } from "../../components/MainContainer";
import { Showcase, ShowcaseContent } from "../../components/Showcase"
import css from "./Landing.module.css"
import { useAtom } from "jotai";
import games, { useUpdateGame } from "@renderer/atoms/games";
import { systemsAtom } from "@renderer/atoms/systems";
import Scrollers, { ScrollerConfig } from "@renderer/components/Scrollers/Scrollers";
import { ScrollElement } from "@renderer/types";

export const Landing = () => {
  const [gamesList] = useAtom(games.list);
  const [recentGamesList] = useAtom(games.recents);

  const [systems] = useAtom(systemsAtom);

  const [currentContent, setCurrentContent] = useState<ShowcaseContent | null>(null);

  const updateGame = useUpdateGame(Number(currentContent?.id));
  const updateLastPlayed = useCallback(() => {
    updateGame({ lastPlayed: new Date().toUTCString() })
  }, [updateGame])

  const scrollers = useMemo<ScrollerConfig<ScrollElement>[]>(() => {
    return [
      {
        id: "all-games",
        label: "All Games",
        elems: gamesList,
        onHighlight: setCurrentContent,
        // onHighlight: setCurrentGameID,
        onSelect: updateLastPlayed
      },
      {
        id: "recent-games",
        elems: recentGamesList,
        label: "Recent Games",
        onHighlight: setCurrentContent
        // onHighlight: setCurrentGameID
      },
      {
        id: "systems",
        elems: systems,
        label: "Systems",
        aspectRatio: "square",
        onHighlight: setCurrentContent,
        // onActiveChange: (isActive) => { if(isActive) setCurrentGameID(null) }
      } as const
    ]
  }, [gamesList, recentGamesList, setCurrentContent, updateLastPlayed, systems]);


  return (
    <div className={css.landing}>
      {currentContent && <Showcase content={currentContent} />}
      <MainContainer>
        <Scrollers scrollers={scrollers} />
      </MainContainer>
    </div>
  )
}
