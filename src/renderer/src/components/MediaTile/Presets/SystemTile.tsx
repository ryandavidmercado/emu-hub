import { System } from "@common/types"
import MediaTile, { MediaTileProps } from "../MediaTile"

type Props = Omit<MediaTileProps, "media"> & { system: System }

const SystemTile = ({
  system,
  aspectRatio = "landscape",
  ...props
}: Props) => {
  const bundledLogo = window.loadMedia({
    resourceType: "logo",
    resourceCollection: "systems",
    resourceId: system.id,
  })

  const tileMedia = {
    foreground: bundledLogo || system.logo
  } as const

  return <MediaTile
    media={tileMedia}
    aspectRatio={aspectRatio}
    {...props}
  />
}

export default SystemTile
