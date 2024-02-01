import { Game } from "@common/types"
import MediaTile, { MediaTileProps, TileMedia } from "../MediaTile"

type Props = Omit<MediaTileProps, "media"> & { game: Game }

const GameTile = ({
  game,
  aspectRatio = "landscape",
  ...props
}: Props) => {
  const tileMedia: TileMedia = (() => {
    if (
      game.poster
      && (!game.gameTileDisplayType || game.gameTileDisplayType === "poster")
      && aspectRatio === "landscape"
    ) return { background: game.poster }

    return { background: game.screenshot, foreground: game.logo, foregroundText: game.name ?? game.romname }
  })()

  return <MediaTile
    media={tileMedia}
    aspectRatio={aspectRatio}
    {...props}
  />
}

export default GameTile
