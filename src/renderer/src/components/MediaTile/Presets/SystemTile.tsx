import { System } from "@common/types"
import MediaTile, { MediaTileProps } from "../MediaTile"

type Props = Omit<MediaTileProps, "media"> & { system: System }

const SystemTile = ({
  system,
  aspectRatio = "landscape",
  ...props
}: Props) => {
  const tileMedia = {
    foreground: {
      resourceType: "logo",
      resourceCollection: "systems",
      resourceId: system.id,
    }
  } as const

  return <MediaTile
    media={tileMedia}
    aspectRatio={aspectRatio}
    {...props}
  />
}

export default SystemTile
