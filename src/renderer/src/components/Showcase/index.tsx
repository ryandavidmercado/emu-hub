import { BsPersonFill } from "react-icons/bs";
import Pill from "../Pill";
import css from "./Showcase.module.scss"
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

export interface ShowcaseContent {
  id: string | number,
  logo?: string,
  description?: string
  players?: number
  hero?: string
}

interface Props {
  content?: ShowcaseContent | null,
  hidden?: boolean
}

export const Showcase = ({ content, hidden = false }: Props) => {
  if(!content) return <div className={css.main} />
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={content.id ?? "null"}
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: .2
          },
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: .2
          }
        }}
        className={classNames(css.main, (hidden || !content) && css.hidden)}
      >
        <div className={classNames(css.content, !content.hero && css.noBg)}>
          <div className={css.logo}>
            <img key={content.logo} src={content.logo} />
          </div>
          <div className={css.description}>
            <div className={css.descText}>{content.description}</div>
            <div className={css.pills}>
              {content.players && <Pill Icon={BsPersonFill} label={String(content.players)} />}
            </div>
          </div>
        </div>
        <div className={css.hero}>
          {content.hero && <img src={content.hero} className={css.image} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
