import { Input } from '../../enums'

type Cb = (input: Input, source: 'gamepad' | 'keyboard') => void

type DIRECTION_BUTTON = Input.LEFT | Input.RIGHT | Input.DOWN | Input.UP
const DIRECTION_BUTTONS = new Set([Input.LEFT, Input.DOWN, Input.RIGHT, Input.UP])

const buttonKeyMap: Record<number, Input> = {
  14: Input.LEFT,
  12: Input.UP,
  15: Input.RIGHT,
  13: Input.DOWN,
  0: Input.A,
  1: Input.B,
  8: Input.SELECT,
  9: Input.START
}

const gamepadReader = (cb: Cb) => {
  const pressedButtons: Record<string, Set<Input>> = {}
  let directionRepeatTimeout: NodeJS.Timeout

  const directionRepeatHandler = (input: Input, controllerId: string) => {
    if (!DIRECTION_BUTTONS.has(input)) return
    if (directionRepeatTimeout) clearTimeout(directionRepeatTimeout)

    const fireDirection = () => {
      if (!pressedButtons[controllerId].has(input)) return
      cb(input, 'gamepad')
      setTimeout(fireDirection, 100)
    }

    directionRepeatTimeout = setTimeout(fireDirection, 400)
  }

  const handleInput = (input: Input, pressed: boolean, controllerId: string) => {
    const isFocused = document.hasFocus();

    if (!pressed) {
      pressedButtons[controllerId].delete(input)
      return
    }

    if (pressedButtons[controllerId].has(input)) return

    if(isFocused) cb(input, 'gamepad')
    pressedButtons[controllerId].add(input)

    if (DIRECTION_BUTTONS.has(input) && isFocused) directionRepeatHandler(input, controllerId)
  }

  const handleGamepads = () => {
    const gamepads = navigator.getGamepads()

    for (const gamepad of gamepads) {
      if (!gamepad) continue
      if (!pressedButtons[gamepad.id]) pressedButtons[gamepad.id] = new Set()

      const pressedDirections = new Set<DIRECTION_BUTTON>()

      gamepad.buttons.forEach((button, i) => {
        const input = buttonKeyMap[i]
        if (!input) return

        if (DIRECTION_BUTTONS.has(input)) {
          if (button.pressed) pressedDirections.add(input as DIRECTION_BUTTON)
          return
        }

        handleInput(input, button.pressed, gamepad.id)
      })

      gamepad.axes.forEach((axis, i) => {
        if (i === 0 && axis < -0.6) pressedDirections.add(Input.LEFT)
        if (i === 0 && axis > 0.6) pressedDirections.add(Input.RIGHT)
        if (i === 1 && axis < -0.6) pressedDirections.add(Input.UP)
        if (i === 1 && axis > 0.6) pressedDirections.add(Input.DOWN)
      })

      handleInput(Input.LEFT, pressedDirections.has(Input.LEFT), gamepad.id)
      handleInput(Input.RIGHT, pressedDirections.has(Input.RIGHT), gamepad.id)
      handleInput(Input.UP, pressedDirections.has(Input.UP), gamepad.id)
      handleInput(Input.DOWN, pressedDirections.has(Input.DOWN), gamepad.id)
    }

    requestAnimationFrame(handleGamepads)
  }

  handleGamepads()
}

export default gamepadReader
