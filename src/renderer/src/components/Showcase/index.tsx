import { BsPersonFill } from "react-icons/bs";
import Pill from "../Pill";
import css from "./Showcase.module.scss"
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import GameLogo from "../GameLogo";
import { useEffect, useState } from "react";

export interface ShowcaseContent {
  id: string | number
  logo?: string,
  description?: string
  players?: number
  hero?: string
}

interface Props {
  content?: ShowcaseContent | null
  hidden?: boolean
  className?: string
}

export const Showcase = ({ content, hidden = false, className }: Props) => {
  if (!content) return <div className={css.main} />

  const [initialOpacity, setInitialOpacity] = useState(1);
  useEffect(() => {
    setInitialOpacity(0)
  }, [])

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={content.id ?? "null"}
        initial={{
          opacity: initialOpacity
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
        className={classNames(css.main, (hidden || !content) && css.hidden, className)}
      >
        <div className={classNames(css.content, !content.hero && css.noBg)}>
          <GameLogo game={content} className={css.logo} />
          <div className={css.description}>
            <div className={css.descText}>{content.description}</div>
            <div className={css.pills}>
              {content.players && <Pill Icon={BsPersonFill} label={String(content.players)} />}
            </div>
          </div>
        </div>
        <div className={css.hero}>
          {content.hero && (
            <img src={content.hero} className={css.image} />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
