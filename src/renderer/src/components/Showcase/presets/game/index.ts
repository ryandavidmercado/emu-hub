import css from "./gamePreset.module.scss";
import { Game } from "@common/types";
import { Pill, ShowcaseContent } from "../..";

export const getGameShowcaseConfig = (game: Game, pills: Pill[]): ShowcaseContent => {
  return {
    left: [{ type: "media", media: game.screenshot || "" }],
    right: [
      game.logo
        ? { type: "media", media: game.logo || "" }
        : { type: "text", text: game.name ?? game.romname, className: css.text },
      { type: "pills", pills }
    ],
  }
}
