import { useCallback, useMemo, useState } from "react";
import { Showcase, ShowcaseContent } from "../../components/Showcase"
import css from "./Home.module.scss"
import { useAtom } from "jotai";
import games from "@renderer/atoms/games";
import { Game, System } from "@common/types";
import systems from "@renderer/atoms/systems";
import Scrollers, { ScrollerConfig } from "@renderer/components/Scrollers/Scrollers";
import useGamePills from "@renderer/components/Pill/hooks/useGamePills";
import { useNavigate } from "react-router-dom";
import collections from "@renderer/atoms/collections";

export const Home = () => {
  const [systemsList] = useAtom(systems.lists.onlyWithGames);

  const [recentGamesList] = useAtom(games.lists.recents);
  const [newGamesList] = useAtom(games.lists.new);

  const [collectionsList] = useAtom(collections.lists.withGames);

  const [currentContent, setCurrentContent] = useState<ShowcaseContent | null>(null);
  const [currentContentType, setCurrentContentType] = useState("game");

  const pills = useGamePills(currentContentType === "game" ? (currentContent as Game) : null);

  const navigate = useNavigate();

  const onGameSelect = useCallback((game: Game) => {
    navigate(`/game/${game.id}`)
  }, [])

  const onGameHighlight = useCallback((game: Game) => {
    setCurrentContent(game);
    setCurrentContentType("game")
  }, []);

  const scrollers = useMemo(() => {
    return [
      {
        id: "recent-games",
        elems: recentGamesList,
        label: "Continue Playing",
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
      } as ScrollerConfig<Game>,
      {
        id: "new-games",
        elems: newGamesList,
        label: "Recently Added",
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
      },
      {
        id: "systems",
        elems: systemsList,
        label: "Systems",
        aspectRatio: "square",
        onHighlight: (content) => {
          setCurrentContent(content);
          setCurrentContentType("system")
        },
        onSelect: (system) => { navigate(`/system/${system.id}`) }
      } as ScrollerConfig<System>,
      ...collectionsList.map(collection => ({
        id: `collection-${collection.id}`,
        elems: collection.games,
        label: collection.name,
        onHighlight: onGameHighlight,
        onSelect: onGameSelect
      }))
    ]
  }, [collectionsList, recentGamesList, setCurrentContent, systemsList]);

  return (
    <div
      className={css.landing}
    >
      <Showcase content={currentContent} pills={pills} />
      <Scrollers scrollers={scrollers} className={css.scrollers} key={scrollers.length} />
    </div>
  )
}
