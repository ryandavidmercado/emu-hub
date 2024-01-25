import { Emulator } from "@common/types/Emulator";
import { arrayConfigAtoms } from "./util/arrayConfigAtom";

export default arrayConfigAtoms<Emulator>({ storageKey: "emulators" });
