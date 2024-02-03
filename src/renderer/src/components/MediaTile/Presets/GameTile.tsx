import { Game } from "@common/types"
import MediaTile, { MediaTileProps, TileMedia } from "../MediaTile"
import { DefaultGameDisplayType } from "@renderer/atoms/defaults/gameDisplayTypes"

type Props = Omit<MediaTileProps, "media"> & { game: Game, displayType?: Game["gameTileDisplayType"] }

const GameTile = ({
  game,
  aspectRatio = "landscape",
  displayType: displayTypeFromProps,
  ...props
}: Props) => {
  const tileMedia: TileMedia = (() => {
    const displayType = displayTypeFromProps ?? game.gameTileDisplayType ?? DefaultGameDisplayType.gameTile;

    const art = displayType === "fanart" ? "hero" : displayType;
    let background = game[art];
    if(!background) background = game.screenshot;

    // we can only use poster on landscape tiles; if set, use screenshot + logo instead
    if(aspectRatio !== "landscape") {
      return {
        background: art === "poster" ? (game.hero ?? game.screenshot) : background,
        foreground: game.logo,
        foregroundText: game.name ?? game.romname
      }
    }

    return {
      background: background,
      foreground: (() => {
        if(art === "poster" && background) return undefined;
        return game.logo
      })(),
      foregroundText: (() => {
        if(art === "poster" && background) return undefined;
        return game.name ?? game.romname
      })()
    }
  })()

  return <MediaTile
    media={tileMedia}
    aspectRatio={aspectRatio}
    {...props}
  />
}

export default GameTile
