import { readFileSync, writeFileSync, rmSync } from "fs";
import YAML from "yaml";
import path from "path";
import { CONFIG_PATH } from "./const";

const configFilePath = (configType: string) => path.join(CONFIG_PATH, `${configType}.yml`);

const loadConfig = <T>(configType: string, defaultValue: T) => {
  try {
    const file = readFileSync(
      configFilePath(configType),
      { encoding: "utf8" }
    );

    return YAML.parse(file) as T
  } catch(e) {
    return defaultValue
  }
}

const saveConfig = <T>(configType: string, value: T) => {
  const yaml = YAML.stringify(value);

  writeFileSync(
    configFilePath(configType),
    yaml,
    { encoding: "utf8" }
  )
}

const deleteConfig = (configType: string) => {
  rmSync(configFilePath(configType))
}

export interface ConfigStorage {
  getItem: <T>(configType: string, initialValue: T) => T,
  setItem: <T>(configType: string, value: T) => void,
  removeItem: (configType: string) => void,
}

const configStorage: ConfigStorage = {
  getItem: loadConfig,
  setItem: saveConfig,
  removeItem: deleteConfig
}

export default configStorage;
