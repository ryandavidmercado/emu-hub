import { eventHandler } from '@renderer/eventHandler'
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
  2: Input.X,
  3: Input.Y,
  8: Input.SELECT,
  9: Input.START,
  6: Input.LT,
  7: Input.RT,
  4: Input.LB,
  5: Input.RB
}

interface Combo {
  id: string,
  inputs: Input[],
  holdTime?: number
}

const combos: Combo[] = [
  {
    id: 'quit-game',
    inputs: [Input.UP, Input.Y, Input.LT, Input.RT],
    holdTime: 500
  }
]

const gamepad = window.gamepad()

gamepad.openDevice()
gamepad.rumbleTest()

const gamepadReader = (cb: Cb) => {
  const pressedButtons: Record<string, Set<Input>> = {}
  const pressedCombos: Record<string, Set<string>> = {}

  let directionRepeatTimeout: NodeJS.Timeout

  const combosHandler = (controllerId: string) => {
    if(!pressedCombos[controllerId]) pressedCombos[controllerId] = new Set()
    const controllerPressedCombos = pressedCombos[controllerId]

    for(const combo of combos) {
      const comboIsHeld = combo.inputs.every(input => pressedButtons[controllerId].has(input))
      if(comboIsHeld) {
        if(controllerPressedCombos.has(combo.id)) return
        controllerPressedCombos.add(combo.id)

        const sendCombo = () => {
          if(!controllerPressedCombos.has(combo.id)) return
          eventHandler.emit('combo', { id: combo.id, focused: document.hasFocus() })
        }

        combo.holdTime ? setTimeout(sendCombo, combo.holdTime) : sendCombo()
      } else {
        controllerPressedCombos.delete(combo.id)
      }
    }
  }

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

      combosHandler(gamepad.id)
    }

    requestAnimationFrame(handleGamepads)
  }

  handleGamepads()
}

export default gamepadReader
