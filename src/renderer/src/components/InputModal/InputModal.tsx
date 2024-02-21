import { Input } from '@renderer/enums/Input'
import { useOnInput } from '@renderer/hooks'
import Modal from '../Modal/Modal'
import css from './InputModal.module.scss'
import { atom, useAtom } from 'jotai'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import { CSSProperties, useState } from 'react'

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
  shiftOnOpen?: boolean
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
    shiftOnOpen = true,
    shiftOnSpace = true
  }: UseInputModalProps) => {
    setLabel(label)
    setInput(defaultValue ?? '')
    setOpen(true)
    setIsPassword(isPassword ?? false)
    setStyle(style ?? {})
    setIsCaps(false)
    setIsShift(shiftOnOpen)
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
        case Input.X: {
          setInput((i) => i.slice(0, -1))
          break
        }
        case Input.Y: {
          setInput((i) => i + ' ')
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
        { input: Input.LT, text: 'Shift' },
        { input: Input.RT, text: 'Caps Lock' }
      ]
      // disableForDevice: "keyboard"
    }
  )
  return (
    <Modal open={open} id="input-modal">
      <div className={css.inputModal} style={style}>
        {/* <div>{label}</div> */}
        <div className={css.inputWrapper}>
          <div className={css.input}>
            {isPassword
              ? modalInput.split('').map(() => '*')
              : modalInput.replaceAll(' ', '\u00A0')}
          </div>
          <div className={css.inputCaret}>|</div>
        </div>
        <Keyboard
          modules={[keyNavigation]}
          onModulesLoaded={(keyboard) => {
            setKeyboardHandler(keyboard)
          }}
          useMouseEvents={true}
          enableKeyNavigation={true}
          onKeyPress={(button) => {
            if (!['{backspace}', '{shift}'].includes(button) && isShift) setIsShift(false)

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
                setInput((i) => i + ' ')
                if (!isCaps && shiftOnSpace) setIsShift(true)
                break
              case '{tab}':
                setInput((i) => i + ' ')
                break
              case '{bksp}':
                setInput((i) => i.slice(0, -1))
                break
              default:
                setInput((i) => i + button)
                break
            }
          }}
          layout={{
            default: [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
              '{tab} q w e r t y u i o p [ ] \\',
              "{lock} a s d f g h j k l ; ' {enter}",
              '{shift} z x c v b n m , . / {shift}',
              '{space}'
            ],
            shift: [
              '~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}',
              '{tab} Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{shift} Z X C V B N M &lt; &gt; ? {shift}',
              '{space}'
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
            '{tab}': 'Tab'
          }}
          mergeDisplay={true}
        />
      </div>
    </Modal>
  )
}
