import { MediaTypes } from "@renderer/atoms/games"
import { PropsWithChildren, useEffect, useState } from "react";

interface Props {
  className?: string;
  mediaContent: MediaTypes;
  mediaType: keyof MediaTypes | (keyof MediaTypes)[];
  onLoaded?: () => void;
}

const MediaImage = ({ children, className, mediaContent, mediaType, onLoaded }: PropsWithChildren<Props>) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const get = async () => {
      let url = "";

      const mediaTypes = typeof mediaType === "string"
        ? [mediaType]
        : mediaType

      for(const mediaType of mediaTypes) {
        try {
          url = await window.loadGameMedia(mediaContent, mediaType);
          if(!url) continue;

          break;
        } catch {
          continue;
        }
      }

      if(!url!) {
        setHasFailed(true);
        onLoaded?.();
      }

      setImgUrl(url)
    }

    get();
  }, [mediaContent, mediaType])

  if(!imgUrl && !hasFailed) return <div className={className} />
  if(!imgUrl) return <>{children}</> ?? <div className={className} />
  return (
    <img
      className={className}
      src={imgUrl}
      onLoad={onLoaded}
    />
  )
}

export default MediaImage
