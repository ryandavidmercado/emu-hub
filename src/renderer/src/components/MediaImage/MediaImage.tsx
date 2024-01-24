import { MediaImageData } from "@common/types/InternalMediaType";
import { PropsWithChildren } from "react";

interface Props {
  className?: string;
  onLoaded?: () => void;
  media?: MediaImageData
}

const MediaImage = ({ children, className, onLoaded, media }: PropsWithChildren<Props>) => {
  const fallback = <>{children}</> ?? <div className={className} />
  if(!media) return fallback;

  const url = window.loadMedia(media);
  if(!url) return fallback;

  return (
    <img
      className={className}
      src={url}
      onLoad={onLoaded}
    />
  )
}

export default MediaImage
