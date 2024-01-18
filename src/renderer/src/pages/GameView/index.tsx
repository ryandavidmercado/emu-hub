import games from "@renderer/atoms/games"
import { Input } from "@renderer/enums";
import { useOnInput, useRecommendationScrollers } from "@renderer/hooks";
import { useAtom } from "jotai"
import css from "./GameView.module.scss"
import IconButtons from "@renderer/components/IconButtons";

import {
  IoCloudDownload,
  IoCloudDownloadOutline,
  IoPlay,
  IoPlayOutline,
} from "react-icons/io5"
import { FaAngleDown } from "react-icons/fa"

import { FaPlus } from "react-icons/fa6"
import { useNavigate, useParams } from "react-router-dom";
import MediaImage from "@renderer/components/MediaImage/MediaImage";
import { useRef, useState } from "react";
import classNames from "classnames";
import TabSelector from "@renderer/components/TabSelector/TabSelector";
import { motion } from "framer-motion";
import GameInfo from "./GameInfo/GameInfo";
import Recommendations from "./Recommendations/Recommendations";

const GameView = ({ gameId }: { gameId?: string }) => {
  const [game] = useAtom(games.single(gameId ?? ""));
  const [, launchGame] = useAtom(games.launch);
  // const [, removeGame] = useAtom(games.remove);
  const [, scrapeGame] = useAtom(games.scrape);

  const [activeSection, setActiveSection] = useState<"game" | "tabs">("game");
  const containerRef = useRef<HTMLDivElement>(null);

  const onGameSection = () => {
    setActiveSection('game');
  }

  const onTabsSection = () => {
    if(!game?.description) return;
    setActiveSection('tabs');
  }

  const navigate = useNavigate();
  const recommendationScrollers = useRecommendationScrollers(game);

  useOnInput((input) => {
    switch (input) {
      case Input.B:
        return navigate(-1);
    }
  })

  if (!game) {
    navigate(-1);
    return null;
  }

  return (
    <motion.div
      animate={{
        translateY: activeSection === "tabs" ? "-98vh" : 0,
        transition: {
          type: "spring",
          mass: .4,
          damping: 12
        }
      }}
      className={css.container} ref={containerRef}
    >
      <div className={css.upperContainer}>
        <MediaImage
          mediaContent={game}
          mediaType={["hero", "screenshot"]}
          className={css.bg}
        />
        <div className={css.buttonsAndLogo}>
          <MediaImage
            mediaContent={game}
            mediaType="logo"
            className={css.logo}
          >
            <div className={css.name}>
              {game.name || game.romname}
            </div>
          </MediaImage>
          <IconButtons
            buttons={[
              {
                id: 'play',
                Icon: IoPlayOutline,
                IconActive: IoPlay,
                label: "Play",
                onSelect: () => { launchGame(game.id) }
              },
              {
                id: 'add-to-collection',
                Icon: FaPlus,
                label: "Add to Collection"
              },
              {
                id: 'scrape',
                Icon: IoCloudDownloadOutline,
                IconActive: IoCloudDownload,
                label: "Scrape",
                onSelect: () => { scrapeGame(game.id) }
              }
            ]}
            isActive={activeSection === "game"}
            onExitDown={onTabsSection}
          />
        </div>
        {game.description &&
          <FaAngleDown className={classNames(css.indicator, activeSection !== "game" && css.hidden)} />
        }
      </div>
      {game.description &&
        <div className={classNames(css.tabsContainer, activeSection !== "tabs" && css.inactive)}>
          <TabSelector
            tabsClassName={css.tabs}
            disabled={activeSection !== "tabs"}
            onExitUp={onGameSection}
            tabs={[
              {
                game,
                id: "info",
                label: "Info",
                Content: GameInfo,
                className: css.description
              },
              {
                game,
                id: "recommendations",
                label: "Recommendations",
                Content: Recommendations,
                canSelect: true,
                className: css.recommendations,
                isInvalid: !recommendationScrollers.length
              }
            ]}
          />
        </div>
      }
    </motion.div>
  );
}

/* We use this to ensure that GameView re-renders when the active game changes */
export const GameViewWrapper = () => {
  const { gameId } = useParams()
  return <GameView gameId={gameId} key={gameId} />
}
