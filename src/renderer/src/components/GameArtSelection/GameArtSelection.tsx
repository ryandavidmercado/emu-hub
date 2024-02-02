import { Game } from "@common/types/Game";
import css from "./GameArtSelection.module.scss";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import GameTile from "../MediaTile/Presets/GameTile";
import { DefaultGameDisplayType } from "@renderer/atoms/defaults/gameDisplayTypes";
import { InputPriority } from "@renderer/const/inputPriorities";
import { ReactNode, useState } from "react";
import classNames from "classnames";
import { displayTypeMap } from "@renderer/const/const";
import { useAtom } from "jotai";
import games from "@renderer/atoms/games";
import MediaImage from "../MediaImage/MediaImage";

interface Props {
  game: Game
  onExit?: () => void
}

const GameArtSelction = ({ game, onExit }: Props) => {
  const [, updateGame] = useAtom(games.single(game.id));

  const tileDisplayType = game.gameTileDisplayType ?? DefaultGameDisplayType.gameTile;
  const showcaseDisplayType = game.showcaseDisplayType ?? DefaultGameDisplayType.showcase;
  const gamePageDisplayType = game.gamePageDisplayType ?? DefaultGameDisplayType.gamePage;

  interface SelectionContent {
    render: ReactNode
    label: string
    id: string
    active: boolean
  }

  const entries = [
    {
      label: "Tile",
      id: "gameTileDisplayType",
      sublabel: `Current: ${displayTypeMap.tile[tileDisplayType]}`,
      content: (game: Game) => {
        return (["fanart", "screenshot", "poster"] as const).map(displayType => {
          const artName = displayType === "fanart" ? "hero" : displayType;
          if(!game[artName]) return null;
          const active =
            tileDisplayType === displayType ||
              (tileDisplayType === "fanart" && displayType === "screenshot" && !game.hero) // workaround; we default to hero but some games don't have them. fallback to screenshot instead

          return {
            render: <GameTile displayType={displayType} game={game} active={active} />,
            label: displayTypeMap.tile[displayType],
            id: displayType,
            active
          }
        }).filter(Boolean) as SelectionContent[]
      }
    } as const,
    {
      label: "Game View",
      id: "gamePageDisplayType",
      sublabel: `Current: ${displayTypeMap.gameView[gamePageDisplayType]}`,
      content: (game: Game) => {
        return (["screenshot", "fanart"] as const).map(displayType => {
          const artName = displayType === "fanart" ? "hero" : "screenshot";
          if(!game[artName]) return null;

          return {
            render: <MediaImage
              media={displayType === "screenshot" ? game.screenshot : game.hero }
              className={classNames(css.img, gamePageDisplayType === displayType && css.active)}
              style={{ aspectRatio: `${window.innerWidth} / ${window.innerHeight}`}}
            />,
            label: displayTypeMap.gameView[displayType],
            id: displayType,
            active: gamePageDisplayType === displayType
          }
        }).filter(Boolean) as SelectionContent[]
      }
    } as const,
    {
      label: "Showcase",
      id: "showcaseDisplayType",
      sublabel: `Current: ${displayTypeMap.showcase[showcaseDisplayType]}`,
      content: (game: Game) => {
        return (["screenshot", "fanart"] as const).map(displayType => {
          const artName = displayType === "fanart" ? "hero" : displayType;
          if(!game[artName]) return null;

          return {
            render: <MediaImage
              media={displayType === "screenshot" ? game.screenshot : game.hero}
              className={classNames(css.img, showcaseDisplayType === displayType && css.active)}
              style={{ aspectRatio: `${(6.5 / 10.5) * window.innerWidth} / ${window.innerHeight * .35}`}}
            />,
            label: displayTypeMap.showcase[displayType],
            id: displayType,
            active: showcaseDisplayType === displayType
          }
        }).filter(Boolean) as SelectionContent[]
      }
    } as const
  ]

  const [activeSelector, setActiveSelector] = useState(0);

  useOnInput((input) => {
    const activeEntry = entries[activeSelector];
    const activeContent = activeEntry.content?.(game);

    switch (input) {
      case Input.B:
        onExit?.();
        break;
      case Input.DOWN:
        setActiveSelector(i => Math.min(i + 1, 2));
        break;
      case Input.UP:
        setActiveSelector(i => Math.max(i - 1, 0));
        break;
      case Input.LEFT:
        const activeContentIndex = activeContent.findIndex(c => c.active);
        const newIndex = Math.max(activeContentIndex - 1, 0);
        updateGame({ [activeEntry.id]: activeContent[newIndex].id })
        break;
      case Input.RIGHT: {
        const activeContentIndex = activeContent.findIndex(c => c.active);
        const newIndex = Math.min(activeContentIndex + 1, activeContent.length - 1);
        updateGame({ [activeEntry.id]: activeContent[newIndex].id })
        break;
      }
    }
  }, {
    priority: InputPriority.GENERAL_MODAL
  });

  // const pills = useGamePills(game);

  return (
    <div className={css.container}>
      <div className={css.left}>
        {entries.map((entry, i) =>
          <div className={classNames(css.row, activeSelector === i && css.active)} key={entry.id}>
            <div>{entry.label}</div>
            <div className={css.sub}>{entry.sublabel}</div>
          </div>
        )}
      </div>
      <div className={css.right}>
        {entries.map((entry, i) =>
          <div className={classNames(css.row, activeSelector === i && css.active)} key={entry.id}>
            {entry.content(game).map(content =>
              <div className={css.contentWithLabel} key={content.id}>
                {content.render}
                <div>{content.label}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameArtSelction
