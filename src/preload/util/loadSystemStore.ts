import path from 'path'
import { SystemStore, StoreEntry } from '@common/types'
import { capitalCase } from 'change-case'

const loadSystemStore = (systemStore: SystemStore, systemId: string): Promise<StoreEntry[]> => {
  switch (systemStore.type) {
    case 'html':
      return handleHTMLStore(systemStore)
    case 'emudeck':
      return handleEmuDeckStore(systemId)
  }
}

const handleHTMLStore = async (store: SystemStore & { type: 'html' }) => {
  const storeHTMLResponse = await fetch(store.url)
  const storeHTML = await storeHTMLResponse.text()

  const dom = new DOMParser().parseFromString(storeHTML, 'text/html')
  const nodes = dom.querySelectorAll<HTMLAnchorElement>(store.selector)

  return [...nodes].map((node) => {
    const rawHref = node.href
    const relativePath = path.basename(rawHref)
    const href = store.url + '/' + relativePath

    const rawName = node.innerText
    const name = path.basename(rawName, path.extname(rawName))

    return {
      href,
      name
    }
  })
}

const handleEmuDeckStore = async (systemId: string) => {
  const storeJSONResponse = await fetch(
    `https://api.github.com/repos/dragoonDorise/EmuDeck/contents/store/${systemId}?ref=main`
  )
  const storeJSON = await storeJSONResponse.json()

  const games = await Promise.all(
    storeJSON.map(async (storeGameEntry) => {
      const gameDataUrl = storeGameEntry.download_url
      const gameDataResponse = await fetch(gameDataUrl)
      const gameData = await gameDataResponse.json()

      const screenshotUrl = gameData.pictures.screenshots?.[0]
      const screenshotFormat = path
        .extname(screenshotUrl ?? '')
        .split('?')[0]
        .slice(1)

      return {
        href: gameData.file,
        name: gameData.title,
        description: gameData.description,
        genre: gameData.tags?.map(capitalCase).join(' / '),
        media:
          screenshotUrl && screenshotFormat
            ? {
                screenshot: {
                  url: screenshotUrl,
                  format: screenshotFormat
                }
              }
            : undefined
      } as StoreEntry
    })
  )

  return games
}

export default loadSystemStore
