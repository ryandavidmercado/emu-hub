import { Unsubscribe, createNanoEvents } from 'nanoevents'
import Modal from '../Modal/Modal'
import { ControllerHint, useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import css from './SelectModal.module.scss'
import classNames from 'classnames'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { InputPriority } from '@renderer/const/inputPriorities'

const eventHandler = createNanoEvents()

export interface SelectModalOption {
  id: string
  label: string
  colorScheme?: 'warning' | 'caution' | 'confirm' | 'default'
}

export interface SelectModalOptions {
  text: string | ReactNode
  defaultSelected?: number
  options: SelectModalOption[]
  canClose?: boolean
}

export const useSelect = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState<string | ReactNode>('')
  const [selected, setSelected] = useState(0)
  const [options, setOptions] = useState<SelectModalOption[]>([])
  const [canClose, setCanClose] = useState(false)

  return {
    getSelection: async ({
      text,
      defaultSelected,
      options,
      canClose = true
    }: SelectModalOptions): Promise<string | null> => {
      setOptions(options)
      setCanClose(canClose)
      setText(text)
      setSelected(defaultSelected ?? 0)
      setOpen(true)

      let unbind: Unsubscribe
      const res = await new Promise<string>((resolve) => {
        unbind = eventHandler.on('selection-response', (selection: string) => {
          resolve(selection)
        })
      })

      setOpen(false)
      unbind!()

      return res
    },
    modalProps: { open, text, selected, setSelected, options, canClose }
  }
}

export interface SelectModalProps {
  open: boolean
  text: string | ReactNode
  selected: number
  setSelected: Dispatch<SetStateAction<number>>
  options: SelectModalOption[]
  canClose: boolean
  onResponse?: (id: string | null) => void
}

const ConfirmationModal = ({
  open,
  text,
  selected,
  setSelected,
  options,
  canClose,
  className,
  onResponse
}: SelectModalProps & { className?: string }) => {
  useOnInput(
    (input) => {
      switch (input) {
        case Input.A:
          eventHandler.emit('selection-response', options[selected].id)
          onResponse?.(options[selected].id)
          break
        case Input.B:
          if (!canClose) break
          eventHandler.emit('selection-response', null)
          onResponse?.(null)
          break
        case Input.LEFT:
          setSelected((s) => Math.max(s - 1, 0))
          break
        case Input.RIGHT:
          setSelected((s) => Math.min(s + 1, options.length - 1))
          break
      }
    },
    {
      priority: InputPriority.INPUT_MODAL,
      disabled: !open,
      hints: [
        { input: "DPADLR", text: "Change Selection" },
        { input: Input.A, text: "Select" },
        canClose && { input: Input.B, text: "Close" }
      ].filter(Boolean) as ControllerHint[]
    }
  )

  return (
    <Modal open={open} id="confirmation">
      <div className={classNames(css.container, className)}>
        <div>{text}</div>
        <div className={css.options}>
          {options.map((option, i) => (
            <div
              className={classNames(
                i === selected && css.active,
                css[option.colorScheme || 'default']
              )}
              key={option.id}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
