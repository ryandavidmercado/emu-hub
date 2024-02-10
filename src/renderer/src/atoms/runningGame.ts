import { Game } from "@common/types";
import { atom } from "jotai";

const defaults = {
  execInstance: null,
  abort: null,
  game: null
}

interface RunningGame {
  execInstance: Promise<void> | null,
  abort: (() => void) | null,
  game: Game | null
}

const baseRunningGameAtom = atom<RunningGame>(defaults);
const runningGameAtom = atom(
  (get) => get(baseRunningGameAtom),
  (_, set, newGame: RunningGame) => {
    newGame.execInstance?.catch().finally(() => {
      set(baseRunningGameAtom, defaults);
      window.focusApp();
    })

    set(baseRunningGameAtom, newGame);
  }
)

const exitGameAtom = atom(null, (get, set) => {
  const runningGame = get(runningGameAtom);
  runningGame.abort?.()
  set(runningGameAtom, defaults);
})

export {
  runningGameAtom,
  exitGameAtom
}
