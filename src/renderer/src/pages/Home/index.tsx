import { useCallback, useMemo, useState } from "react";
import { Showcase, ShowcaseContent } from "../../components/Showcase"
import css from "./Home.module.scss"
import { useAtom } from "jotai";
import games from "@renderer/atoms/games";
import { Game, SystemWithGames } from "@common/types";
import systems from "@renderer/atoms/systems";
import Scrollers, { ScrollerConfig } from "@renderer/components/Scrollers/Scrollers";
import useGamePills from "@renderer/components/Pill/hooks/useGamePills";
import { useNavigate } from "react-router-dom";
import collections from "@renderer/atoms/collections";
import { getGameShowcaseConfig } from "@renderer/components/Showcase/presets/game";
import { getSystemShowcaseConfig } from "@renderer/components/Showcase/presets/system";

export const Home = () => {
  const [systemsList] = useAtom(systems.lists.onlyWithGames);

  const [recentlyViewedGamesList] = useAtom(games.lists.recents);
  const [continuePlayingGamesList] = useAtom(games.lists.recentlyPlayed);
  const [newGamesList] = useAtom(games.lists.new);

  const [collectionsList] = useAtom(collections.lists.withGames);

  const [currentContent, setCurrentContent] = useState<{ type: "game", data: Game } | { type: "system", data: SystemWithGames }>();
  const gamePills = useGamePills(currentContent?.type === "game" ? currentContent.data : null);

  const navigate = useNavigate();

  const onGameSelect = useCallback((game: Game) => {
    navigate(`/game/${game.id}`)
  }, [])

  const onGameHighlight = useCallback((game: Game) => {
    setCurrentContent({
      type: "game",
      data: game
    });
  }, []);

  const showcaseContent: ShowcaseContent = (() => {
    if(!currentContent) return {};
    switch(currentContent.type) {
      case "game":
        return getGameShowcaseConfig(currentContent.data, gamePills)
      case "system":
        return getSystemShowcaseConfig(currentContent.data)
    }
  })()

  const scrollers = useMemo(() => {
    return [
      {
        id: "recent-games",
        elems: recentlyViewedGamesList,
        label: "Recently Viewed",
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
      } as ScrollerConfig<Game>,
      {
        id: "continue-games",
        elems: continuePlayingGamesList,
        label: "Continue Playing",
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
      },
      {
        id: "systems",
        elems: systemsList,
        label: "Systems",
        aspectRatio: "square",
        onHighlight: (system) => {
          setCurrentContent({
            type: "system",
            data: system
          });
        },
        onSelect: (system) => { navigate(`/system/${system.id}`) },
        contentType: "system"
      } as ScrollerConfig<SystemWithGames>,
      {
        id: "new-games",
        elems: newGamesList,
        label: "Recently Added",
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
      },
      ...collectionsList.map(collection => ({
        id: `collection-${collection.id}`,
        elems: collection.games,
        label: collection.name,
        onHighlight: onGameHighlight,
        onSelect: onGameSelect,
        aspectRatio: "square" as const
      }))
    ]
  }, [collectionsList, recentlyViewedGamesList, setCurrentContent, systemsList]);

  return (
    <div
      className={css.landing}
    >
      <Showcase content={showcaseContent} />
      <Scrollers scrollers={scrollers} className={css.scrollers} key={scrollers.length} />
    </div>
  )
}
