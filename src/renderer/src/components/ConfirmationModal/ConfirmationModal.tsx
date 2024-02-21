import { atom, useAtom } from 'jotai'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import Modal from '../Modal/Modal'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums'
import css from './ConfirmationModal.module.scss'
import classNames from 'classnames'
import { InputPriority } from '@renderer/const/inputPriorities'

const openAtom = atom(false)
const textAtom = atom<string | undefined>(undefined)
const isConfirmAtom = atom(false)

const eventHandler = createNanoEvents()

export interface Options {
  text?: string
  defaultToConfirmed?: boolean
}

export const useConfirmation = () => {
  const [, setOpen] = useAtom(openAtom)
  const [, setText] = useAtom(textAtom)
  const [, setIsConfirm] = useAtom(isConfirmAtom)

  return async ({ text, defaultToConfirmed = true }: Options): Promise<boolean> => {
    setIsConfirm(defaultToConfirmed)
    setText(text)
    setOpen(true)

    let unbind: Unsubscribe
    const res = await new Promise<boolean>((resolve) => {
      unbind = eventHandler.on('confirmation-response', (response: boolean) => {
        resolve(response)
      })
    })

    setOpen(false)
    unbind!()

    return res
  }
}

const ConfirmationModal = () => {
  const [open] = useAtom(openAtom)
  const [text] = useAtom(textAtom)
  const [isConfirm, setIsConfirm] = useAtom(isConfirmAtom)

  useOnInput(
    (input) => {
      switch (input) {
        case Input.A:
          eventHandler.emit('confirmation-response', isConfirm)
          break
        case Input.B:
          eventHandler.emit('confirmation-response', false)
          break
        case Input.LEFT:
          setIsConfirm(true)
          break
        case Input.RIGHT:
          setIsConfirm(false)
          break
      }
    },
    {
      priority: InputPriority.INPUT_MODAL,
      disabled: !open,
      hints: [
        { input: Input.B, text: "Cancel" },
        { input: Input.A, text: "Select" }
      ]
    }
  )

  return (
    <Modal open={open} id="confirmation">
      <div className={css.container}>
        <div>{text}</div>
        <div className={css.options}>
          <div className={classNames(css.confirm, isConfirm && css.active)}>Confirm</div>
          <div className={classNames(css.cancel, !isConfirm && css.active)}>Cancel</div>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
