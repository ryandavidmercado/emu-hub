import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useEffect } from "react";
import css from "./Modal.module.scss";
import { createPortal } from "react-dom";
import { atom, useAtom } from "jotai";

interface Props {
  open: boolean;
  id: string;
}

export const openModalAtom = atom<null | string>(null);

const Modal = ({ open, children, id }: PropsWithChildren<Props>) => {
  const [, setOpenModal] = useAtom(openModalAtom);

  useEffect(() => {
    if(!open) return setOpenModal(null);
    return setOpenModal(id);
  }, [open, id])

  return createPortal(
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
    </AnimatePresence>,
    document.body
  )
}

export default Modal;
