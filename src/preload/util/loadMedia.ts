import mime from 'mime'
import bufferToDataUrl from 'buffer-to-data-url'
import { MediaImageData } from '@common/types/InternalMediaType'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'

import path from 'path'

const localAssets = import.meta.glob<{ default: string }>('../../../resources/**/*', {
  eager: true
})

let map: Record<string, string> = {}

const readLocalMedia = (mediaPath: string) => {
  try {
    const imgFile = readFileSync(mediaPath)
    const mimeType = mime.getType(mediaPath)

    if (!mimeType) throw "Couldn't get file MIME type!"

    const url = bufferToDataUrl(mimeType, imgFile) as unknown as string
    map[mediaPath] = url
    return url
  } catch (e) {
    return ''
  }
}

const readLocalMediaAsync = async (mediaPath: string) => {
  try {
    const imgFile = await readFile(mediaPath)
    const mimeType = mime.getType(mediaPath)

    if (!mimeType) throw "Couldn't get file MIME type!"

    const url = bufferToDataUrl(mimeType, imgFile) as unknown as string
    map[mediaPath] = url
    return url
  } catch (e) {
    return ''
  }
}

const getExternalPath = (mediaPath: string, mode: "sync" | "async") => {
  if (map[mediaPath]) return map[mediaPath]
  if (
    mediaPath.includes('http://') ||
    mediaPath.includes('https://') ||
    mediaPath.includes('data:')
  )
    return mediaPath
  return mode === "sync" ? readLocalMedia(mediaPath) : readLocalMediaAsync(mediaPath)
}

const loadMedia = (media: MediaImageData): string => {
  if (typeof media === 'string') {
    return getExternalPath(media, "sync") as string
  }

  // load from internal assets
  const dataUrl = Object.entries(localAssets).find(([key]) => {
    const extname = path.extname(key)
    return (
      key ===
      `../../../resources/${media.resourceCollection}/${media.resourceId}/${media.resourceType}${extname}`
    )
  })?.[1]?.default

  return dataUrl ?? ''
}

export const loadMediaAsync = async (media: MediaImageData): Promise<string> => {
  if (typeof media === 'string') {
    return getExternalPath(media, "async") as Promise<string>
  }

  // load from internal assets
  const dataUrl = Object.entries(localAssets).find(([key]) => {
    const extname = path.extname(key)
    return (
      key ===
      `../../../resources/${media.resourceCollection}/${media.resourceId}/${media.resourceType}${extname}`
    )
  })?.[1]?.default

  return dataUrl ?? ''
}

export const refreshImages = () => {
  map = {}
}

export default loadMedia
