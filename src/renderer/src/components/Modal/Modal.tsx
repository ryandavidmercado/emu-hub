import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren } from "react";
import css from "./Modal.module.scss";

interface Props {
  open: boolean;
}

const Modal = ({ open, children }: PropsWithChildren<Props>) => {
  return (
    <AnimatePresence>
      {open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .1 }}
          className={css.modal}
        >
          {children}
        </motion.div>
      }
    </AnimatePresence>
  )
}

export default Modal;
