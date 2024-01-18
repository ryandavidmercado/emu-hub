import { useEffect } from "react"
import { Input } from "../enums"

let captureStack: string[] = []

interface Capture {
  bypassCapture?: boolean;
  captureKey?: string
  parentCaptureKeys?: string[]
  isCaptured?: boolean
  disabled?: boolean
}

export const useOnInput = (cb: (input: Input) => void, captureSettings?: Capture) => {
  const { bypassCapture, captureKey, isCaptured, disabled, parentCaptureKeys = [] } = captureSettings ?? {};

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
    "Escape": Input.B,
    "Backspace": Input.START
  }

  useEffect(() => {
    if(!captureKey) return;

    if(isCaptured && !captureStack.includes(captureKey)) {
      captureStack = [captureKey, ...captureStack]
    } else if (!isCaptured && captureStack.includes(captureKey)) {
      captureStack = captureStack.filter(entry => entry !== captureKey)
    }
  }, [captureKey, isCaptured])

  const isKey = (key: string): key is keyof typeof keyMap => key in keyMap
  const handleKey = (e: KeyboardEvent) => {
    if(disabled) return;

    const capturedKey = captureStack[0];
    if(capturedKey && (capturedKey !== captureKey) && !parentCaptureKeys.includes(capturedKey) && !bypassCapture) return;

    if (isKey(e.key)) cb(keyMap[e.key])
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => { window.removeEventListener("keydown", handleKey) }
  }, [cb])
}
