import css from "./gamePreset.module.scss";
import { Game } from "@common/types";
import { Pill, ShowcaseContent } from "../..";

export const getGameShowcaseConfig = (game: Game, pills: Pill[]): ShowcaseContent => {
  const gameLogo = window.loadMedia(game.logo || "");

  return {
    left: [{
      type: "media",
      media: (
        game.showcaseDisplayType === "fanart" ? game.hero : game.screenshot
      ) ?? ''
    }],
    right: [
      gameLogo
        ? { type: "media", media: gameLogo }
        : { type: "text", text: game.name ?? game.romname, className: css.text },
      { type: "pills", pills }
    ],
  }
}
