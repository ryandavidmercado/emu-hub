import { Game, System } from '@common/types'
import path from 'path'
import ShortUniqueId from 'short-unique-id'
import { readdir, stat } from 'fs/promises'
import { nameMappers } from '@common/features/nameMapping'
import { AppConfig } from '@common/types'

const uid = new ShortUniqueId()

const scanRoms = async (paths: AppConfig['paths'], currentSystems: System[], currentGames: Game[]) => {
  const getGameLookupKey = (romname: string, systemId: string, rompath: string[] = []) =>
    `${romname}-${systemId}-${rompath.join('_')}`
  const gameLookupMap: Record<string, Game> = currentGames.reduce((acc, game) => {
    const key = getGameLookupKey(game.romname, game.system, game.rompath)
    acc[key] = game
    return acc
  }, {})

  const { roms: romPath } = paths

  const addedDate = new Date().toUTCString()
  const newGames: Game[] = []
  const romsDir = await readdir(romPath)

  const scanFolder = async (systemConfig: System, pathTokens: string[] = []) => {
    const systemRomDir = systemConfig.romdir || path.join(romPath, systemConfig.id)

    const dir = path.join(systemRomDir, ...pathTokens)
    let contents: string[]

    try {
      contents = await readdir(dir)
    } catch (e) {
      console.error(`Failed to read ${systemConfig.name} directory at "${dir}"`)
      return
    }

    // handle multi-part games by filtering out other tracks/discs
    contents = contents.filter((entry) => !entry.match(/\((Track|Disc) [^1]\)/))
    if (!contents.length) return
    if (contents.includes('.eh-ignore')) return

    const extnames = systemConfig.fileExtensions

    for (const entry of contents) {
      const entryPath = path.join(dir, entry)
      const entryExt = path.extname(entry)
      const entryStat = await stat(entryPath)

      const isValidExt = extnames.includes(entryExt.toLowerCase())

      if (entryStat.isDirectory() && !isValidExt) {
        await scanFolder(systemConfig, [...pathTokens, entry])
        continue
      }

      if (!isValidExt) continue

      const lookupKey = getGameLookupKey(entry, systemConfig.id, pathTokens)
      const gameConfigEntry = gameLookupMap[lookupKey]

      if (gameConfigEntry) {
        newGames.push(gameConfigEntry)
        continue
      }

      const name = (() => {
        const defaultName = path.basename(entry, entryExt)

        const nameConfig = systemConfig.defaultNames?.[entryExt.toLowerCase()]
        if (!nameConfig) return defaultName

        let name: string
        switch (nameConfig.type) {
          case 'pathToken':
            name = pathTokens.at(nameConfig.token) ?? defaultName
        }

        if (nameConfig.map) name = nameMappers[nameConfig.map](name)
        return name
      })()

      newGames.push({
        id: uid.rnd(),
        rompath: pathTokens.length ? pathTokens : undefined,
        romname: entry,
        system: systemConfig.id,
        name,
        added: addedDate
      })
    }
  }

  const scanQueue: Promise<void>[] = []
  for (const system of romsDir) {
    const systemConfig = currentSystems.find((config) => config.id === system)
    if (!systemConfig) continue

    scanQueue.push(scanFolder(systemConfig))
  }

  await Promise.allSettled(scanQueue)
  return newGames
}

export default scanRoms
