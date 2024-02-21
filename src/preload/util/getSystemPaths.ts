import { existsSync } from 'fs';
import os from 'os'
import path from 'path';
import { execSync } from 'child_process'

export const getSystemPaths = () => {
  let data: string;
  let config: string;
  let romsDefault: string;

  const HOME_PATH = os.homedir()

  const APP_NAME = 'EmuHub'
  const APP_CONFIG_SUBDIR = 'EmuHubConfig'

  switch(os.platform()) {
    case 'linux': {
      data = path.join(
        (process.env.XDG_DATA_HOME ?? path.join(HOME_PATH, '.local', 'share')),
        APP_NAME
      )

      config = path.join(
        (process.env.XDG_CONFIG_HOME ?? path.join(HOME_PATH, '.config')),
        APP_NAME,
        APP_CONFIG_SUBDIR
      )

      const emudeckConfig = path.join(HOME_PATH, '.config', 'EmuDeck', 'backend', 'functions', 'all.sh')
      if(existsSync(emudeckConfig)) {
        try {
          const stdout = execSync(`source ${emudeckConfig} && echo $romsPath`, { encoding: 'utf8' })
          if(stdout) {
            romsDefault = stdout
            break
          }
        } catch {}
      }

      romsDefault = path.join(data, 'roms')
      break
    }
    case 'darwin': {
      data = path.join(HOME_PATH, 'Documents', APP_NAME)
      config = path.join(HOME_PATH, 'Library', 'Application Support', APP_NAME, APP_CONFIG_SUBDIR)
      romsDefault = path.join(data, 'roms')
    }
    case 'win32': {
      data = path.join(HOME_PATH, 'Documents', APP_NAME)
      config = path.join(HOME_PATH, 'AppData', 'Roaming', APP_NAME, APP_CONFIG_SUBDIR)
      romsDefault = path.join(data, 'roms')
    }
    default: {
      throw('os not supported')
    }
  }

  return {
    data,
    config,
    romsDefault
  }
}
