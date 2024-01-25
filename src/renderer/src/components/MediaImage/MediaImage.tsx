import { MediaImageData } from "@common/types/InternalMediaType";
import { PropsWithChildren, useState } from "react";

interface Props {
  className?: string;
  fallbackClassName?: string;
  onLoaded?: () => void;
  media?: MediaImageData
}

const MediaImage = ({ children, className, fallbackClassName, onLoaded, media }: PropsWithChildren<Props>) => {
  const [isErr, setIsErr] = useState(false);

  const fallback = children ? <>{children}</> : <div className={fallbackClassName ?? className} />
  if(!media) return fallback;

  const url = window.loadMedia(media);
  if(!url) return fallback;

  if(isErr) return fallback;
  return (
    <img
      className={className}
      src={url}
      onLoad={onLoaded}
      onError={() => { setIsErr(true) }}
    />
  )
}

export default MediaImage
