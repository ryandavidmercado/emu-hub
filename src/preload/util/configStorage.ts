import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'fs'
import YAML from 'yaml'
import path from 'path'

import { CONFIG_PATH } from './const'

const configFilePath = (configType: string) => path.join(CONFIG_PATH, `${configType}.yml`)

const saveConfig = <T>(configType: string, value: T) => {
  const yaml = YAML.stringify(value)

  mkdirSync(CONFIG_PATH, { recursive: true });
  writeFileSync(configFilePath(configType), yaml, { encoding: 'utf8' })
}

export const writeDefaultConfig = (configType: string, value: any) => {
  const defaultsPath = path.join(CONFIG_PATH, 'defaults');
  mkdirSync(defaultsPath, { recursive: true });

  const readmePath = path.join(defaultsPath, "README.txt");
  writeFileSync(readmePath, "The files in this folder are provided for reference. Any changes made will be ignored and overwritten!\n\nTo modify defaults or add new entries, use the respective config files in the main config folder.")

  const configPath = path.join(defaultsPath, `${configType}.yml`);
  writeFileSync(configPath, YAML.stringify(value));
}

export const loadConfig = <T>(configType: string, defaultValue: T) => {
  try {
    const file = readFileSync(configFilePath(configType), { encoding: 'utf8' })

    return YAML.parse(file) as T
  } catch (e) {
    saveConfig(configType, defaultValue)
    return defaultValue
  }
}

const deleteConfig = (configType: string) => {
  rmSync(configFilePath(configType))
}

export interface ConfigStorage {
  getItem: <T>(configType: string, initialValue: T) => T
  setItem: <T>(configType: string, value: T) => void
  removeItem: (configType: string) => void
}

const configStorage: ConfigStorage = {
  getItem: loadConfig,
  setItem: saveConfig,
  removeItem: deleteConfig
}

export default configStorage
