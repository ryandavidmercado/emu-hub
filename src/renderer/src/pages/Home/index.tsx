import { useCallback, useState } from "react";
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

  const [recentlyViewedGamesList] = useAtom(games.lists.recentlyViewed);
  const [recentlyPlayedGamesList] = useAtom(games.lists.recentlyPlayed);
  const [recentlyAddedGamesList] = useAtom(games.lists.recentlyAdded);

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
    if (!currentContent) return {};
    switch (currentContent.type) {
      case "game":
        return getGameShowcaseConfig(currentContent.data, gamePills)
      case "system":
        return getSystemShowcaseConfig(currentContent.data)
    }
  })()

  const scrollers = [
    {
      id: "continue-playing",
      elems: recentlyPlayedGamesList,
      label: "Continue Playing",
      onHighlight: onGameHighlight,
      onSelect: onGameSelect,
    } as ScrollerConfig<Game>,
    {
      id: "recently-added",
      elems: recentlyAddedGamesList,
      label: "Recently Added",
      onHighlight: onGameHighlight,
      onSelect: onGameSelect,
    } as ScrollerConfig<Game>,
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
      id: "recently-viewed",
      elems: recentlyViewedGamesList,
      label: "Recently Viewed",
      onHighlight: onGameHighlight,
      onSelect: onGameSelect,
    } as ScrollerConfig<Game>,
    ...collectionsList.map(collection => ({
      id: `collection-${collection.id}`,
      elems: collection.games,
      label: collection.name,
      onHighlight: onGameHighlight,
      onSelect: onGameSelect,
      aspectRatio: collection.games.length < 5
        ? "landscape" as const
        : "square" as const
    })) as ScrollerConfig<Game>[]
  ]

  return (
    <div
      className={css.landing}
    >
      <Showcase className={css.showcase} content={showcaseContent} />
      <Scrollers scrollers={scrollers} className={css.scrollers} key={scrollers.length} />
    </div>
  )
}
