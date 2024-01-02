import { useEffect } from "react"
import { Input } from "../enums"

export const useOnInput = (cb: (input: Input) => void) => {
  const keyMap = {
    ArrowLeft: Input.LEFT,
    ArrowRight: Input.RIGHT,
    ArrowUp: Input.UP,
    ArrowDown: Input.DOWN,
    a: Input.LEFT,
    d: Input.RIGHT,
    w: Input.UP,
    s: Input.DOWN,
    " ": Input.A,
    "Enter": Input.A,
    "Escape": Input.B
  }

  const isKey = (key: string): key is keyof typeof keyMap => key in keyMap
  const handleKey = (e: KeyboardEvent) => {
    if (isKey(e.key)) cb(keyMap[e.key])
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => { window.removeEventListener("keydown", handleKey) }
  }, [cb])
}
