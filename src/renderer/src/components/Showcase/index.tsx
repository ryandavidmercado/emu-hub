import Pill from "../Pill";
import css from "./Showcase.module.scss"
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useState } from "react";
import MediaImage from "../MediaImage/MediaImage";
import { IconType } from "react-icons";

export interface ShowcaseContent {
  id: string
  logo?: string,
  description?: string
  players?: string
  name?: string;
  romname?: string;
  hero?: string
  screenshot?: string;
}

export interface Pill {
  Icon: IconType,
  text: string
  id: string
}

type Props = PropsWithChildren<{
  content?: ShowcaseContent | null
  className?: string
  pills?: Pill[]
  hideEmptyHero?: boolean;
  logoClassName?: string;
}>

export const Showcase = ({ content, className, children, pills, hideEmptyHero }: Props) => {
  if (!content) return <div className={css.main} />

  return (
    <div
      className={classNames(css.main, className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
      {
        (content.hero || !hideEmptyHero) && (
          <motion.div
            key={`${content.hero}-${content.screenshot}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: .1 } }}
            exit={{ opacity: 0, transition: { duration: .1 } }}
            className={css.hero}
          >
            <MediaImage
              mediaContent={content}
              mediaType="hero"
              className={css.image}
            />
          </motion.div>
        )
      }
      </AnimatePresence>
      <ShowcaseContent
        key={`content-${content.id}`}
        content={content}
        pills={pills}
        children={children}
      />
    </div>
  );
}

type ContentProps = PropsWithChildren<{
  content: ShowcaseContent
  pills?: Pill[]
}>

const ShowcaseContent = ({ content, pills, children }: ContentProps) => {
  const [opacity, setOpacity] = useState(0);
  return (
    <div
      className={css.outerContent}
    >
      <div
        className={css.innerContent}
        style={{ opacity: (!pills || !pills.length) ? 1 : opacity }}
      >
        {!(pills && pills.length) && content.description && (
          <div className={css.description}>
            {content.description}
          </div>
        )}
        {Boolean(pills?.length) &&
          <>
            <MediaImage
              mediaContent={content}
              mediaType="logo"
              className={css.logo}
              onLoaded={() => { setOpacity(1) }}
            >
              <div className={css.name}>{content.name || content.romname}</div>
            </MediaImage>
            <div className={css.pills}>
              {pills!.map(pill => <Pill key={pill.id} Icon={pill.Icon} label={pill.text} />)}
            </div>
          </>
        }
        {children}
      </div>
    </div>
  )
}
