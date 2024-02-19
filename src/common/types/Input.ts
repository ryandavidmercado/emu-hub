import { Sdl } from "@kmamal/sdl"

export enum Input {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
  A = 'A',
  B = 'B',
  X = 'X',
  Y = 'Y',
  START = 'START',
  SELECT = 'SELECT',
  LB = 'LB',
  RB = 'RB',
  LT = 'LT',
  RT = 'RT'
}

export type InputLabel = Input | "DPAD" | "DPADLR" | "DPADUD"

export const sdlButtonToInputMap: Partial<Record<Sdl.Controller.Button, Input>> = {
  dpadLeft: Input.LEFT,
  dpadRight: Input.RIGHT,
  dpadUp: Input.UP,
  dpadDown: Input.DOWN,
  a: Input.A,
  b: Input.B,
  x: Input.X,
  y: Input.Y,
  guide: Input.SELECT,
  start: Input.START,
  leftShoulder: Input.LB,
  rightShoulder: Input.RB,
}

export const keyboardToInputMap: Partial<Record<KeyboardEvent['key'], Input>> = {
  ArrowLeft: Input.LEFT,
  ArrowRight: Input.RIGHT,
  ArrowUp: Input.UP,
  ArrowDown: Input.DOWN,
  a: Input.LEFT,
  d: Input.RIGHT,
  w: Input.UP,
  s: Input.DOWN,
  Enter: Input.A,
  Escape: Input.B,
  Backspace: Input.START,
  Tab: Input.SELECT
}
