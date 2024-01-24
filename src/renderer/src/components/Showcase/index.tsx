import Pill from "../Pill";
import css from "./Showcase.module.scss"
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren } from "react";
import { IconType } from "react-icons";
import MediaImage from "../MediaImage/MediaImage";
import { MediaImageData } from "@common/types/InternalMediaType";

export interface Pill {
  Icon: IconType,
  text: string
  id: string
}

type ShowcaseEntry = {
  type: "media", media: MediaImageData, className?: string
} | {
  type: "text", text: string, className?: string
} | {
  type: "pills", pills: Pill[], className?: string
}

type Props = PropsWithChildren<{
  className?: string
  hideEmptyHero?: boolean;
  logoClassName?: string;
  content?: {
    left?: ShowcaseEntry[],
    right?: ShowcaseEntry[],
    background?: MediaImageData,
    classNames?: {
      pill?: string;
      left?: string;
      right?: string;
      background?: string;
    }
  },
}>

export type ShowcaseContent = Props["content"]

export const Showcase = ({ content, className }: Props) => {
  const entryToElem = (entry: ShowcaseEntry, side: "left" | "right") => {
    switch(entry.type) {
      case "media":
        return (
          <MediaImage
            className={classNames(side === "left" ? css.imgLeft : css.imgRight, entry.className)}
            media={entry.media}
            key={JSON.stringify(entry.media)}
          />
        )
      case "text":
        return (
          <div
            className={classNames(css.text, entry.className)}
            key={entry.text}
          >
              {entry.text}
          </div>
        )
      case "pills":
        return  (
          <div key="pills" className={classNames(css.pills, entry.className)}>
            {entry.pills.map(pill => (
              <Pill label={pill.text} Icon={pill.Icon} className={classNames(css.pill, content?.classNames?.pill)} key={pill.id} />
            ))}
          </div>
        )
    }
  }

  return (
    <div
      className={classNames(css.main, className)}
    >
      <div className={css.outerContent}>
        <AnimatePresence mode="popLayout">
          <motion.div
            className={css.innerContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: .1 }}}
            exit={{ opacity: 0, transition: { duration: .1 }}}
            key={JSON.stringify(content)}
          >
            {content?.background && (
              <MediaImage
                media={content.background}
                className={classNames(css.background, content.classNames?.background)}
              />
            )}
            {content?.left && (
              <div className={classNames(css.left, content.classNames?.left)}>
                {content.left.map((c) => entryToElem(c, "left"))}
              </div>
            )}
            {content?.right && (
              <div className={classNames(css.right, content.classNames?.right)}>
                {content.right.map((c) => entryToElem(c, "right"))}
              </div>
          )}
         </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
