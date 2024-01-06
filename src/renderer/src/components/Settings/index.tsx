import { Input } from "@renderer/enums";
import { useOnInput } from "@renderer/hooks";
import { ReactNode, useEffect, useState } from "react"
import css from "./Settings.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import SectionSelector from "./SectionSelector";
import { IoGameController, IoGameControllerOutline, IoSettings, IoSettingsOutline } from "react-icons/io5";
import { IconType } from "react-icons";
import Games from "./Games/Games";
import classNames from "classnames";

export interface Section {
  component: ({ isActive }: { isActive: boolean }) => ReactNode
  id: string;
  label: string;
  Icon: IconType;
  IconActive: IconType;
}

const Settings = () => {
  const [open, setOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setActiveSide("left");
    setActiveSection(0);
  }, [open])

  useOnInput(
    (input) => {
      switch(input) {
        case Input.START: {
          return setOpen(open => !open);
        }
      }
    },
    {
      captureKey: "settings-modal",
      isCaptured: open,
    }
  )

  useOnInput(
    (input) => {
      switch(input) {
        case Input.LEFT: {
          return setActiveSide("left");
        }
        case Input.RIGHT: {
          return setActiveSide("right");
        }
        case Input.A: {
          if(activeSide === "left") setActiveSide("right");
          break;
        }
        case Input.B: {
          if(activeSide === "left") setOpen(false)
          else setActiveSide("left");

          break;
        }
      }
    },
    {
      captureKey: "settings-modal",
      isCaptured: open,
      disabled: !open
    }
  )

  const sections: Section[] = [
    {
      id: 'general',
      label: 'General',
      Icon: IoSettingsOutline,
      IconActive: IoSettings,
      component: () => null
    },
    {
      id: 'games',
      label: 'Games',
      Icon: IoGameControllerOutline,
      IconActive: IoGameController,
      component: Games
    }
  ]

  const ActiveComponent = sections[activeSection]?.component

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
          <div className={css.body}>
            <div className={css.left}>
              <SectionSelector
                sections={sections}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isActive={activeSide === "left"}
              />
            </div>
            <div className={classNames(css.right, (activeSide !== "right") && css.inactive)}>
              <ActiveComponent isActive={activeSide === "right"} />
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>
  )
}

export default Settings;
