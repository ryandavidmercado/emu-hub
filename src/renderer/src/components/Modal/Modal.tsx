import { AnimatePresence, motion } from 'framer-motion'
import { PropsWithChildren } from 'react'
import css from './Modal.module.scss'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  id: string
}

const Modal = ({ open, children }: PropsWithChildren<Props>) => {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className={css.modal}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
