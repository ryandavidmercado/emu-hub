import Pill from "../Pill";
import css from "./Showcase.module.scss"
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren } from "react";
import MediaImage from "../MediaImage/MediaImage";
import { IconType } from "react-icons";

export interface ShowcaseContent {
  id: string
  logo?: string,
  description?: string
  players?: string
  name?: string;
  hero?: string
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
  hideLogo?: boolean;
}>

export const Showcase = ({ content, className, children, pills, hideEmptyHero, logoClassName, hideLogo }: Props) => {
  if (!content) return <div className={css.main} />

  return (
    <div
      className={classNames(css.main, className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
      {
        ((content.hero || content.logo) || !hideEmptyHero) && (
          <motion.div
            key={content.hero}
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
            {!hideLogo && content.logo && (
              <>
                <div className={css.heroOverlay} />
                <MediaImage
                  mediaContent={content}
                  mediaType="logo"
                  className={classNames(css.logoOverlay, logoClassName)}
                />
              </>
            )}
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
  // const [opacity, setOpacity] = useState(0);
  return (
    <div
      className={css.outerContent}
    >
      <div
        className={css.innerContent}
      >
        {content.description &&
          <div className={css.description}>
            {content.description}
          </div>
        }
        {Boolean(pills?.length) &&
          <div className={css.pills}>
            {pills!.map(pill => <Pill key={pill.id} Icon={pill.Icon} label={pill.text} />)}
          </div>
        }
        {children}
      </div>
    </div>
  )
}
