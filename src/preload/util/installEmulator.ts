import { Emulator } from "@common/types";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

const installEmulator = (emulator: Emulator, type: "flatpak") => {
  switch(type) {
    case "flatpak": {
      if(!("linux" in emulator.location)
        || !emulator.location.linux
        || !("flatpak" in emulator.location.linux)
        || !emulator.location.linux.flatpak
      ) {
        throw "Can't install flatpak for an emulator without a flatpak ID!"
      }

      return exec(`flatpak install ${emulator.location.linux.flatpak} -y --noninteractive --system`);
    }
  }
}

export { installEmulator }
