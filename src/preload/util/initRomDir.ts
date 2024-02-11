import { System } from '@common/types'
import { AppConfig } from '@common/types'
import { mkdir } from 'fs/promises'
import path from 'path'

const initRomDir = async (paths: AppConfig['paths'], systems: System[]) => {
  const { roms: romPath } = paths

  try {
    await mkdir(romPath)
  } catch (e) {}

  for (const system of systems) {
    if (system.romdir) continue

    const systemPath = path.join(romPath, system.id)
    await mkdir(systemPath, { recursive: true })
  }
}

export default initRomDir
