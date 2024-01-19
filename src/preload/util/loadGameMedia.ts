import { MediaTypes } from "../types/Game";
import { readFile } from "fs/promises";
import mime from "mime"
import bufferToDataUrl from "buffer-to-data-url";

const map: Record<string, string> = {};

const loadGameMedia = async (game: MediaTypes, mediaType: keyof MediaTypes) => {
  const mediaPath = game[mediaType];
  if(!mediaPath) return "";

  if(map[mediaPath]) return map[mediaPath];
  if(mediaPath.includes("http://") || mediaPath.includes("https://")) return mediaPath;

  const imgFile = await readFile(mediaPath);
  const mimeType = mime.getType(mediaPath);

  if(!mimeType) return "";

  let url = "";
  try {
    url = await bufferToDataUrl(mimeType, imgFile)
  } catch(e) {
    console.error(e)
  } finally {
    map[mediaPath] = url;
    return url;
  }
}

export default loadGameMedia;
