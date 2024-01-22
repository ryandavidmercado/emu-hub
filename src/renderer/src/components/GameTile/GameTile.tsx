import classNames from "classnames"
import css from "./GameTile.module.scss";
import GameLogo from "../GameLogo";
import { CSSProperties, useState } from "react";
import MediaImage from "../MediaImage/MediaImage";

interface Props {
  active?: boolean
  activeRef?: React.RefObject<HTMLDivElement>
  aspectRatio?: "landscape" | "square"
  poster?: string,
  logo?: string,
  name?: string,
  style?: CSSProperties
  swapTransform?: boolean
  className?: string
  screenshot?: string;
}

const GameTile = ({
  aspectRatio = "landscape",
  active = false,
  activeRef,
  className,
  poster,
  screenshot,
  logo,
  name,
  style,
  swapTransform
}: Props) => {
  return (
    <div
      className={classNames(css.elem, css[aspectRatio], {
        [css.active]: active,
        [css.noPoster]: !poster || aspectRatio !== "landscape",
        [css.swapTransform]: swapTransform
      }, className)}
      ref={active ? activeRef : null}
      style={style}
    >
      {aspectRatio === "landscape" && poster &&
        <MediaImage
          mediaContent={{ poster }}
          mediaType="poster"
          className={css.image}
        >
          <GameLogo
            game={{ logo, name }}
            textClassName={css.elemText}
            imgClassName={css.logo}
          />
        </MediaImage>
      }
      {aspectRatio === "landscape" && !poster &&
        <>
          <MediaImage
            mediaContent={{ screenshot }}
            mediaType="screenshot"
            className={css.bg}
          />
          <GameLogo
            game={{ logo, name }}
            textClassName={css.elemText}
            imgClassName={css.logo}
          />
        </>
      }
      {aspectRatio === "square" &&
        <>
          <MediaImage
            mediaContent={{ screenshot }}
            mediaType="screenshot"
            className={css.bg}
          />
          <GameLogo
            game={{ logo, name }}
            textClassName={css.elemText}
            imgClassName={css.logo}
          />
        </>
      }
    </div>
  )
}

export default GameTile
