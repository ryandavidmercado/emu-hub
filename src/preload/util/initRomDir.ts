import { System } from '@common/types'
import { AppConfig } from '@common/types'
import { mkdir } from 'fs/promises'
import path from 'path'
import { ROMS_PATH } from './const'

const initRomDir = async (paths: AppConfig['paths'], systems: System[]) => {
  const { roms: configRomPath } = paths
  const romPath = configRomPath || ROMS_PATH

  try {
    await mkdir(romPath)
  } catch (e) {}

  for (const system of systems) {
    if (system.romdir) continue

    const systemPath = path.join(romPath, system.id)
    await mkdir(systemPath, { recursive: true })
  }

  return romPath
}

export default initRomDir
