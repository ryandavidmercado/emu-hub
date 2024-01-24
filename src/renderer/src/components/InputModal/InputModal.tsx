import { Input } from "@renderer/enums/Input";
import { useOnInput } from "@renderer/hooks";
import Modal from "../Modal/Modal";
import css from "./InputModal.module.scss";
import { atom, useAtom } from "jotai";
import { Unsubscribe, createNanoEvents } from "nanoevents";
import { CSSProperties, useState } from "react";

import keyNavigation from "simple-keyboard-key-navigation";
import Keyboard, { KeyboardButtonTheme, SimpleKeyboard } from "react-simple-keyboard";

import "react-simple-keyboard/build/css/index.css";
import "./keyboard.scss";

const labelAtom = atom("");
const eventHandler = createNanoEvents();
const modalOpenAtom = atom(false);
const inputAtom = atom("");
const isPasswordAtom = atom(false);
const styleAtom = atom<CSSProperties>({});
const isCapsAtom = atom<boolean>(false);
const isShiftAtom = atom<boolean>(false);

interface UseInputModalProps {
  label: string;
  defaultValue?: string;
  isPassword?: boolean;
  style?: CSSProperties;
}

export const useInputModal = () => {
  const [, setOpen] = useAtom(modalOpenAtom);
  const [, setLabel] = useAtom(labelAtom);
  const [, setInput] = useAtom(inputAtom);
  const [, setIsPassword] = useAtom(isPasswordAtom);
  const [, setStyle] = useAtom(styleAtom);
  const [, setIsCaps] = useAtom(isCapsAtom);
  const [, setIsShift] = useAtom(isShiftAtom);

  return async ({ label, defaultValue, isPassword, style }: UseInputModalProps) => {
    setLabel(label);
    setInput(defaultValue ?? "");
    setOpen(true);
    setIsPassword(isPassword ?? false);
    setStyle(style ?? {});
    setIsCaps(false);
    setIsShift(false);

    let unbindCancelListener: Unsubscribe;
    let unbindSubmitHandler: Unsubscribe;

    return new Promise<string | null>((resolve) => {
      unbindCancelListener = eventHandler.on("input-modal-closed", () => {
        resolve(null)
      })

      unbindSubmitHandler = eventHandler.on("input-modal-submit", (value) => {
        resolve(value)
      })
    }).then((res) => {
        unbindCancelListener();
        unbindSubmitHandler();
        setOpen(false);

        return res;
    })
  }
}

export const InputModal = () => {
  const [modalInput, setInput] = useAtom(inputAtom);
  const [open] = useAtom(modalOpenAtom);
  // const [label] = useAtom(labelAtom);
  // const [isPassword] = useAtom(isPasswordAtom);
  const [style] = useAtom(styleAtom);

  const [isCaps, setIsCaps] = useAtom(isCapsAtom);
  const [isShift, setIsShift] = useAtom(isShiftAtom);

  const [keyboardHandler, setKeyboardHandler] = useState<SimpleKeyboard>();

  useOnInput((input) => {
    if(!keyboardHandler) return;
    switch(input) {
      case Input.A:
        keyboardHandler?.modules.keyNavigation.press();
        break;
      case Input.B:
        eventHandler.emit("input-modal-closed");
        break;
      case Input.DOWN:
        keyboardHandler?.modules.keyNavigation.down();
        break;
      case Input.UP:
        keyboardHandler?.modules.keyNavigation.up();
        break;
      case Input.LEFT:
        keyboardHandler?.modules.keyNavigation.left();
        break;
      case Input.RIGHT:
        keyboardHandler?.modules.keyNavigation.right();
        break;
      case Input.START:
        eventHandler.emit("input-modal-submit", modalInput)
        break;
    }
  }, {
    disabled: !open,
    priority: 99
  })
  return (
    <Modal
      open={open}
      id="input-modal"
    >
      <div className={css.inputModal} style={style}>
        {/* <div>{label}</div> */}
        <div className={css.inputWrapper}>
          <div className={css.input}>{modalInput.replaceAll(" ", "\u00A0")}</div>
          <div className={css.inputCaret}>|</div>
        </div>
        <Keyboard
          modules={[keyNavigation]}
          onModulesLoaded={(keyboard) => { setKeyboardHandler(keyboard) }}
          useMouseEvents={true}
          enableKeyNavigation={true}
          onKeyPress={(button) => {
            switch(button) {
              case "{enter}":
                eventHandler.emit("input-modal-submit", modalInput)
                break;
              case "{lock}":
                setIsCaps(isCaps => !isCaps)
                if(isShift) setIsShift(false);
                break;
              case "{shift}":
                setIsShift(isShift => !isShift)
                if(isCaps) setIsCaps(false);
                break;
              case "{space}":
                setInput(i => i + " ");
                console.log(modalInput)
              case "{tab}":
                setInput(i => i + " ");
                break;
              case "{bksp}":
                setInput(i => i.slice(0, -1));
                break;
              default:
                if(isShift) {
                  setIsShift(false)
                }
                setInput(i => i + button)
                break;
            }
          }}
          layout={{
            'default': [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
              '{tab} q w e r t y u i o p [ ] \\',
              '{lock} a s d f g h j k l ; \' {enter}',
              '{shift} z x c v b n m , . / {shift}',
              '{space}'
            ],
            'shift': [
              '~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}',
              '{tab} Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{shift} Z X C V B N M &lt; &gt; ? {shift}',
              '{space}'
            ]
          }}
          layoutName={isShift || isCaps ? "shift" : "default"}
          buttonTheme={[
            isCaps && { class: css.activeBtn, buttons: "{lock}" },
            isShift && { class: css.activeBtn, buttons: "{shift}" }
          ].filter(Boolean) as KeyboardButtonTheme[]}
          display={{
            "{bksp}": "Backspace",
            "{enter}": "&nbsp;".repeat(5) + "Enter" + "&nbsp;".repeat(5),
            "{shift}": "&nbsp;".repeat(8) + "Shift" + "&nbsp;".repeat(8),
            "{lock}": "Caps Lock",
            "{tab}": "Tab"
          }}
          mergeDisplay={true}
        />
      </div>
    </Modal>
  );
}
