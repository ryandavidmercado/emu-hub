import mime from "mime"
import bufferToDataUrl from "buffer-to-data-url";
import { MediaImageData } from "@common/types/InternalMediaType";
import { readFileSync } from "fs";
import path from "path";

const localAssets = import.meta.glob<{ default: string }>('../../../resources/**/*', { eager: true });

const readLocalMedia = (mediaPath: string) => {
  try {
    const imgFile = readFileSync(mediaPath);
    const mimeType = mime.getType(mediaPath);

    if (!mimeType) throw ("Couldn't get file MIME type!")

    const url = bufferToDataUrl(mimeType, imgFile) as unknown as string;
    return url;
  } catch (e) {
    return ""
  }
}

const getExternalPath = (mediaPath: string) => {
  if (mediaPath.includes("http://") || mediaPath.includes("https://") || mediaPath.includes("data:")) return mediaPath;
  return readLocalMedia(mediaPath)
}

const loadMedia = (media: MediaImageData): string => {
  if(typeof media === "string") {
    return getExternalPath(media);
  }

  // load from internal assets
  const dataUrl = Object.entries(localAssets)
    .find(([key]) => {
      const extname = path.extname(key);
      return key === `../../../resources/${media.resourceCollection}/${media.resourceId}/${media.resourceType}${extname}`
    }
    )?.[1]?.default;

  return dataUrl ?? '';
}

export default loadMedia;
