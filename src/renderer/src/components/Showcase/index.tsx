import Pill from "../Pill";
import css from "./Showcase.module.scss"
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, forwardRef } from "react";
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
  return (
    <div
      className={classNames(css.main, className)}
    >
      <div className={css.outerContent}>
        {/* <AnimatePresence mode="popLayout"> */}
        <div
          className={css.innerContent}
        >
          {content?.background && (
            <MediaImage
              media={content.background}
              className={classNames(css.background, content.classNames?.background)}
            />
          )}
          <AnimatePresence mode="popLayout">
            <Content
              content={content?.left}
              side="left"
              className={classNames(css.left, content?.classNames?.left)}
              pillClass={content?.classNames?.pill}
              key={JSON.stringify(content?.left)}
            />
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            <Content
              content={content?.right}
              side="right"
              className={classNames(css.right, content?.classNames?.right)}
              pillClass={content?.classNames?.pill}
              key={JSON.stringify(content?.right)}
            />
          </AnimatePresence>
        </div>
        {/* </AnimatePresence> */}
      </div>
    </div>
  );
}

const entryToElem = (entry: ShowcaseEntry, side: "left" | "right", pillClass?: string) => {
  switch (entry.type) {
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
      return (
        <div key="pills" className={classNames(css.pills, entry.className)}>
          {entry.pills.map(pill => (
            <Pill label={pill.text} Icon={pill.Icon} className={pillClass} key={pill.id} />
          ))}
        </div>
      )
  }
}

interface ContentProps {
  className?: string,
  content?: ShowcaseEntry[],
  side: "left" | "right",
  pillClass?: string,
}

const Content = forwardRef<HTMLDivElement, ContentProps>(({ className, content, side, pillClass }, ref) => {
  const animProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: .1 } },
    exit: { opacity: 0, transition: { duration: .1 } }
  }

  return (
    <motion.div {...animProps} className={className} ref={ref}>
      {content?.map((entry) => entryToElem(entry, side, pillClass))}
    </motion.div>
  )
})
