import { eventHandler } from '@renderer/eventHandler'
import { Input } from '../../enums'
import { sdlButtonToInputMap } from '@common/types/Input'

type Cb = (input: Input, source: 'gamepad' | 'keyboard') => void

type DIRECTION_BUTTON = Input.LEFT | Input.RIGHT | Input.DOWN | Input.UP
const DIRECTION_BUTTONS = new Set([Input.LEFT, Input.DOWN, Input.RIGHT, Input.UP])

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

const gamepadReader = (cb: Cb) => {
  const pressedButtons: Record<number, Set<Input>> = {}
  const pressedCombos: Record<number, Set<string>> = {}

  let directionRepeatTimeout: NodeJS.Timeout

  const combosHandler = (controllerId: number) => {
    if (!pressedCombos[controllerId]) pressedCombos[controllerId] = new Set()
    const controllerPressedCombos = pressedCombos[controllerId]

    for (const combo of combos) {
      const comboIsHeld = combo.inputs.every(input => pressedButtons[controllerId].has(input))
      if (comboIsHeld) {
        if (controllerPressedCombos.has(combo.id)) return
        controllerPressedCombos.add(combo.id)

        const sendCombo = () => {
          if (!controllerPressedCombos.has(combo.id)) return
          eventHandler.emit('combo', { id: combo.id, focused: document.hasFocus() })
        }

        combo.holdTime ? setTimeout(sendCombo, combo.holdTime) : sendCombo()
      } else {
        controllerPressedCombos.delete(combo.id)
      }
    }
  }

  const directionRepeatHandler = (input: Input, controllerId: number) => {
    if (!DIRECTION_BUTTONS.has(input)) return
    if (directionRepeatTimeout) clearTimeout(directionRepeatTimeout)

    const fireDirection = () => {
      if (!pressedButtons[controllerId].has(input)) return
      cb(input, 'gamepad')
      setTimeout(fireDirection, 100)
    }

    directionRepeatTimeout = setTimeout(fireDirection, 400)
  }

  const handleInput = (input: Input, pressed: boolean, controllerId: number) => {
    const isFocused = document.hasFocus();

    if (!pressed) {
      pressedButtons[controllerId].delete(input)
      return
    }

    if (pressedButtons[controllerId].has(input)) return

    if (isFocused) cb(input, 'gamepad')
    pressedButtons[controllerId].add(input)

    if (DIRECTION_BUTTONS.has(input) && isFocused) directionRepeatHandler(input, controllerId)
  }

  const gamepadHandler = window.sdlGamepad()
  gamepadHandler.onButton('down', (input, id) => { handleInput(input, true, id )})
  gamepadHandler.onButton('up', (input, id) => { handleInput(input, false, id )})


  // const handleGamepads = () => {
  //   const gamepads = sdlGamepad.getDevices()

  //   for (const gamepad of gamepads) {
  //     if (!gamepad) continue

  //     if (!pressedButtons[gamepad.device.id]) pressedButtons[gamepad.device.id] = new Set()

  //     const pressedDirections = new Set<DIRECTION_BUTTON>()

  //     Object.entries(gamepad.buttons).forEach(([button, pressed]) => {
  //       const input = sdlButtonToInputMap[button]
  //       if (!input) return

  //       if (DIRECTION_BUTTONS.has(input)) {
  //         if (pressed) pressedDirections.add(input as DIRECTION_BUTTON)
  //         return
  //       }

  //       handleInput(input, pressed, gamepad.device.id)
  //     })

  //     Object.entries(gamepad.axes).forEach(([axis, value]) => {
  //       switch(axis) {
  //         case 'leftStickX': {
  //           if (value < -0.6) pressedDirections.add(Input.LEFT)
  //           if (value > .6) pressedDirections.add(Input.RIGHT)
  //         }
  //         case 'leftStickY': {
  //           if (value < -0.6) pressedDirections.add(Input.UP)
  //           if (value > .6) pressedDirections.add(Input.DOWN)
  //         }
  //       }
  //     })

  //     handleInput(Input.LEFT, pressedDirections.has(Input.LEFT), gamepad.device.id)
  //     handleInput(Input.RIGHT, pressedDirections.has(Input.RIGHT), gamepad.device.id)
  //     handleInput(Input.UP, pressedDirections.has(Input.UP), gamepad.device.id)
  //     handleInput(Input.DOWN, pressedDirections.has(Input.DOWN), gamepad.device.id)

  //     combosHandler(gamepad.device.id)
  //   }

  //   requestAnimationFrame(handleGamepads)
  // }

  // handleGamepads()
}

export default gamepadReader
