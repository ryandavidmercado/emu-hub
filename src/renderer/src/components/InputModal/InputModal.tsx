import { Input } from '@renderer/enums/Input'
import { useOnInput } from '@renderer/hooks'
import Modal from '../Modal/Modal'
import css from './InputModal.module.scss'
import { atom, useAtom } from 'jotai'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import { CSSProperties, useRef, useState } from 'react'

import keyNavigation from 'simple-keyboard-key-navigation'
import Keyboard, { KeyboardButtonTheme, SimpleKeyboard } from 'react-simple-keyboard'

import 'react-simple-keyboard/build/css/index.css'
import './keyboard.scss'
import { InputPriority } from '@renderer/const/inputPriorities'

const labelAtom = atom<string | undefined>('')
const eventHandler = createNanoEvents()
const modalOpenAtom = atom(false)
const inputAtom = atom('')
const isPasswordAtom = atom(false)
const styleAtom = atom<CSSProperties>({})
const isCapsAtom = atom<boolean>(false)
const isShiftAtom = atom<boolean>(false)
const shiftOnSpaceAtom = atom<boolean>(true)

interface UseInputModalProps {
  label?: string
  defaultValue?: string
  isPassword?: boolean
  style?: CSSProperties
  shiftOnSpace?: boolean
}

export const useInputModal = () => {
  const [, setOpen] = useAtom(modalOpenAtom)
  const [, setLabel] = useAtom(labelAtom)
  const [, setInput] = useAtom(inputAtom)
  const [, setIsPassword] = useAtom(isPasswordAtom)
  const [, setStyle] = useAtom(styleAtom)
  const [, setIsCaps] = useAtom(isCapsAtom)
  const [, setIsShift] = useAtom(isShiftAtom)
  const [, setShiftOnSpace] = useAtom(shiftOnSpaceAtom)

  return async ({
    label,
    defaultValue,
    isPassword,
    style,
    shiftOnSpace = true
  }: UseInputModalProps) => {
    setLabel(label)
    setInput(defaultValue ?? '')
    setOpen(true)
    setIsPassword(isPassword ?? false)
    setStyle(style ?? {})
    setIsCaps(false)
    setIsShift(false)
    setShiftOnSpace(shiftOnSpace)

    let unbindCancelListener: Unsubscribe
    let unbindSubmitHandler: Unsubscribe

    return new Promise<string | null>((resolve) => {
      unbindCancelListener = eventHandler.on('input-modal-closed', () => {
        resolve(null)
      })

      unbindSubmitHandler = eventHandler.on('input-modal-submit', (value) => {
        resolve(value)
      })
    }).then((res) => {
      unbindCancelListener()
      unbindSubmitHandler()
      setOpen(false)

      return res
    })
  }
}

export const InputModal = () => {
  const [modalInput, setInput] = useAtom(inputAtom)
  const [open] = useAtom(modalOpenAtom)
  // const [label] = useAtom(labelAtom);
  const [isPassword] = useAtom(isPasswordAtom)
  const [style] = useAtom(styleAtom)

  const [isCaps, setIsCaps] = useAtom(isCapsAtom)
  const [isShift, setIsShift] = useAtom(isShiftAtom)
  const [shiftOnSpace] = useAtom(shiftOnSpaceAtom)

  const [keyboardHandler, setKeyboardHandler] = useState<SimpleKeyboard>()

  const inputRef = useRef<HTMLInputElement>(null)

  const cursorLeft = () => {
    if(!inputRef.current?.selectionStart) return
    const newPosition = Math.max(inputRef.current.selectionStart - 1, 0)
    inputRef.current.setSelectionRange(newPosition, newPosition)
  }

  const cursorRight = () => {
    if(!inputRef.current?.selectionStart) return
    const newPosition = Math.min(inputRef.current.selectionStart + 1, inputRef.current.value.length)
    inputRef.current.setSelectionRange(newPosition, newPosition)
  }

  const backspace = () => {
    if(!inputRef.current?.selectionStart) return

    const text = inputRef.current.value
    const insertionIndex = inputRef.current.selectionStart ?? inputRef.current.value.length

    const newText = text.slice(0, insertionIndex - 1) + text.slice(insertionIndex)
    const newIndex = insertionIndex - 1

    setInput(newText)
    setTimeout(() => { inputRef.current?.setSelectionRange(newIndex, newIndex) }, 5)
  }

  const insertChar = (char: string) => {
    if(!inputRef.current?.selectionStart) return

    const text = inputRef.current.value
    const insertionIndex = inputRef.current.selectionStart ?? inputRef.current.value.length

    const newText = text.slice(0, insertionIndex) + char + text.slice(insertionIndex)
    const newIndex = insertionIndex + 1

    setInput(newText)
    setTimeout(() => { inputRef.current?.setSelectionRange(newIndex, newIndex) }, 5)
  }

  useOnInput(
    (input) => {
      if (!keyboardHandler) return
      switch (input) {
        case Input.A:
          keyboardHandler?.modules.keyNavigation.press()
          break
        case Input.B:
          eventHandler.emit('input-modal-closed')
          break
        case Input.DOWN:
          keyboardHandler?.modules.keyNavigation.down()
          break
        case Input.UP:
          keyboardHandler?.modules.keyNavigation.up()
          break
        case Input.LEFT: {
          const module = keyboardHandler?.modules.keyNavigation
          if (!module) break

          const markerPosition = module.markerPosition
          let { row, button } = markerPosition
          if (button === 0) {
            while (module.getButtonAt(row, button)) {
              button += 1
            }

            module.setMarker(row, button - 1)
            break
          }

          module.left()
          break
        }
        case Input.RIGHT: {
          const module = keyboardHandler?.modules.keyNavigation
          if (!module) break

          const { row, button } = module.markerPosition
          if (!module.getButtonAt(row, button + 1)) {
            module.setMarker(row, 0)
            break
          }

          module.right()
          break
        }
        case Input.LB: {
          cursorLeft()
          break
        }
        case Input.RB: {
          cursorRight()
          break
        }
        case Input.X: {
          backspace()
          break
        }
        case Input.Y: {
          insertChar(' ')
          break
        }
        case Input.LT: {
          setIsShift(s => !s)
          break
        }
        case Input.RT: {
          setIsCaps(c => !c)
          break
        }
        case Input.START:
          eventHandler.emit('input-modal-submit', modalInput)
          break
      }
    },
    {
      disabled: !open,
      priority: InputPriority.INPUT_MODAL,
      hints: [
        { input: Input.B, text: 'Cancel' },
        { input: Input.X, text: 'Backspace' },
        { input: Input.Y, text: 'Space' },
        { input: Input.START, text: 'Submit' },
        { input: Input.LB, text: 'Cursor Left' },
        { input: Input.RB, text: 'Cursor Right' },
        { input: Input.LT, text: 'Shift' },
        { input: Input.RT, text: 'Caps Lock' }
      ],
      disableForDevice: "keyboard"
    }
  )

  useOnInput((input) => {
    switch (input) {
      case Input.A:
        eventHandler.emit('input-modal-submit', modalInput)
        break
      case Input.B:
        eventHandler.emit('input-modal-closed')
        break
    }
  },
  {
    disabled: !open,
    priority: InputPriority.INPUT_MODAL,
    hints: [
      { input: Input.B, text: 'Cancel' }
    ],
    disableForDevice: 'gamepad'
  })

  return (
    <Modal open={open} id="input-modal">
      <div className={css.inputModal} style={style}>
        {/* <div>{label}</div> */}
        <input
          className={css.input}
          value={modalInput}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          onBlur={(e) => e.target.focus()}
          spellCheck='false'
          type={isPassword ? 'password' : 'text'}
          ref={inputRef}
          inputMode='none' // disables triggering steam deck virtual keyboard; the trigger is too buggy to use in practice
        />
        <Keyboard
          modules={[keyNavigation]}
          onModulesLoaded={(keyboard) => {
            setKeyboardHandler(keyboard)
          }}
          useMouseEvents={true}
          enableKeyNavigation={true}
          onKeyPress={(button) => {
            if (!['{bksp}', '{shift}'].includes(button) && isShift) setIsShift(false)

            if(!inputRef.current) return
            const insertionIndex = inputRef.current.selectionStart ?? inputRef.current.value.length

            switch (button) {
              case '{enter}':
                eventHandler.emit('input-modal-submit', modalInput)
                break
              case '{lock}':
                setIsCaps((isCaps) => !isCaps)
                break
              case '{shift}':
                setIsShift((isShift) => !isShift)
                if (isCaps) setIsCaps(false)
                break
              case '{space}':
                insertChar(' ')
                if (!isCaps && shiftOnSpace) setIsShift(true)
                break
              case '{tab}':
                insertChar(' ')
                break
              case '{bksp}':
                if(insertionIndex === 0) break
                backspace()
                break
              case '{left}':
                cursorLeft()
                break
              case '{right}':
                cursorRight()
                break
              default:
                insertChar(button)
                break
            }
          }}
          layout={{
            default: [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
              '{tab} q w e r t y u i o p [ ] \\',
              "{lock} a s d f g h j k l ; ' {enter}",
              '{shift} z x c v b n m , . / {shift}',
              '{space} {left} {right}'
            ],
            shift: [
              '~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}',
              '{tab} Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{shift} Z X C V B N M &lt; &gt; ? {shift}',
              '{space} {left} {right}'
            ]
          }}
          layoutName={isShift || isCaps ? 'shift' : 'default'}
          buttonTheme={
            [
              isCaps && { class: css.activeBtn, buttons: '{lock}' },
              isShift && { class: 'hg-button-shift-active', buttons: '{shift}' }
            ].filter(Boolean) as KeyboardButtonTheme[]
          }
          display={{
            '{bksp}': 'Backspace',
            '{enter}': '&nbsp;'.repeat(5) + 'Enter' + '&nbsp;'.repeat(5),
            '{shift}': '&nbsp;'.repeat(8) + 'Shift' + '&nbsp;'.repeat(8),
            '{lock}': 'Caps Lock',
            '{tab}': 'Tab',
            '{left}': '←',
            '{right}': '→'
          }}
          mergeDisplay={true}
        />
      </div>
    </Modal>
  )
}
