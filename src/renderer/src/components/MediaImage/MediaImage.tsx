import { MediaImageData } from '@common/types/InternalMediaType'
import { CSSProperties, PropsWithChildren, useEffect, useState } from 'react'

interface Props {
  className?: string
  fallbackClassName?: string
  onLoaded?: () => void
  media?: MediaImageData
  style?: CSSProperties
  async?: boolean
}

const MediaImage = ({
  children,
  className,
  fallbackClassName,
  onLoaded,
  media,
  style,
  async
}: PropsWithChildren<Props>) => {
  const [isErr, setIsErr] = useState(false)
  const [asyncUrl, setAsyncUrl] = useState("")

  useEffect(() => {
    if(!async) return;

    const getMedia = async () => {
      try {
        const url = await window.loadMediaAsync(media ?? '');
        console.log(url)
        setAsyncUrl(url);
      } catch (e) {
        setAsyncUrl('fail')
      }
    }

    getMedia();
  }, [media, async])

  const fallback = children ? (
    <>{children}</>
  ) : (
    <div className={fallbackClassName ?? className} style={style} />
  )
  if (!media) return fallback

  const url = async ? '' : window.loadMedia(media);
  if(!async && !url) return fallback

  if(async && !asyncUrl) return null;
  if(async && asyncUrl === "fail") return fallback;

  if (isErr) return fallback
  return (
    <img
      className={className}
      src={async ? asyncUrl : url}
      style={style}
      onLoad={onLoaded}
      onError={() => {
        setIsErr(true)
      }}
    />
  )
}

export default MediaImage
