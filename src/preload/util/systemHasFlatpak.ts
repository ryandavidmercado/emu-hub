import { execSync } from "child_process";
import os from "os";

let hasFlatpak = false;

if(os.platform() === "linux") {
  try {
    execSync('which flatpak');
    hasFlatpak = true;
  } catch {}
}

export { hasFlatpak }
