import classNames from "classnames"
import css from "./MediaTile.module.scss";
import { CSSProperties } from "react";
import MediaImage from "../MediaImage/MediaImage";
import { MediaImageData } from "@common/types/InternalMediaType";

export interface TileMedia {
  background?: MediaImageData
  foreground?: MediaImageData
  foregroundText?: string
}

export type AspectRatio = "landscape" | "square"

export interface MediaTileProps {
  active?: boolean
  activeRef?: React.RefObject<HTMLDivElement>
  aspectRatio?: AspectRatio
  style?: CSSProperties
  swapTransform?: boolean
  className?: string
  screenshot?: string;
  media: TileMedia;
}

const MediaTile = ({
  aspectRatio = "landscape",
  active = false,
  activeRef,
  className,
  style,
  swapTransform,
  media
}: MediaTileProps) => {
  return (
    <div
      className={classNames(css.elem, css[aspectRatio], {
        [css.active]: active,
        [css.swapTransform]: swapTransform
      }, className)}
      ref={active ? activeRef : null}
      style={style}
    >
      {media.background &&
        <MediaImage
          media={media.background}
          className={classNames(css.background, media.foreground && css.withForeground)}
        />
      }
      {media.foreground &&
        <MediaImage
          media={media.foreground}
          className={css.foreground}
        />
      }
      {media.foregroundText && !media.foreground && !media.background &&
        <div className={css.foregroundTextWrapper}>
          <div className={css.foregroundText}>
            {media.foregroundText}
          </div>
        </div>
      }
    </div>
  )
}

export default MediaTile
