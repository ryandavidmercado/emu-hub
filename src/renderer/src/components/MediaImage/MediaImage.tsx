import { MediaImageData } from '@common/types/InternalMediaType'
import { CSSProperties, PropsWithChildren, useState } from 'react'

interface Props {
  className?: string
  fallbackClassName?: string
  onLoaded?: () => void
  media?: MediaImageData
  style?: CSSProperties
}

const MediaImage = ({
  children,
  className,
  fallbackClassName,
  onLoaded,
  media,
  style
}: PropsWithChildren<Props>) => {
  const [isErr, setIsErr] = useState(false)

  const fallback = children ? (
    <>{children}</>
  ) : (
    <div className={fallbackClassName ?? className} style={style} />
  )
  if (!media) return fallback

  const url = window.loadMedia(media)
  if (!url) return fallback

  if (isErr) return fallback
  return (
    <img
      className={className}
      src={url}
      style={style}
      onLoad={onLoaded}
      onError={() => {
        setIsErr(true)
      }}
    />
  )
}

export default MediaImage
