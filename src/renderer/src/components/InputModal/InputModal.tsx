import { Input } from "@renderer/enums/Input";
import { useOnInput } from "@renderer/hooks";
import Modal from "../Modal/Modal";
import css from "./InputModal.module.scss";
import { atom, useAtom } from "jotai";
import { Unsubscribe, createNanoEvents } from "nanoevents";
import { CSSProperties } from "react";

const labelAtom = atom("");
const eventHandler = createNanoEvents();
const modalOpenAtom = atom(false);
const inputAtom = atom("");
const isPasswordAtom = atom(false);
const styleAtom = atom<CSSProperties>({});

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

  return async ({ label, defaultValue, isPassword, style }: UseInputModalProps) => {
    setLabel(label);
    setInput(defaultValue ?? "");
    setOpen(true);
    setIsPassword(isPassword ?? false);
    setStyle(style ?? {});

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
  const [label] = useAtom(labelAtom);
  const [isPassword] = useAtom(isPasswordAtom);
  const [style] = useAtom(styleAtom);

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        eventHandler.emit("input-modal-closed");
        break;
      case Input.A:
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
        <div>{label}</div>
        <input
          ref={(elem) => { elem?.focus(); }}
          value={modalInput}
          onChange={(e) => { setInput(e.target.value )}}
          type={isPassword ? "password" : "text"}
        />
      </div>
    </Modal>
  );
}