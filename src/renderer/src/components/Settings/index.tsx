import { Input } from "@renderer/enums";
import { useOnInput } from "@renderer/hooks";
import { ReactNode, useEffect, useMemo, useState } from "react"
import css from "./Settings.module.scss";
import SectionSelector from "./SectionSelector";
import Games from "./Games/Games";
import classNames from "classnames";
import Stores from "./Stores/Stores";

import { IconType } from "react-icons";
import { IoGameController, IoGameControllerOutline } from "react-icons/io5";
import { AiOutlineAppstore, AiFillAppstore } from "react-icons/ai";
import { BsCollection, BsCollectionFill } from "react-icons/bs";
import Modal, { openModalAtom } from "../Modal/Modal";
import Collections from "./Collections/Collections";
import { useAtom } from "jotai";

const sections: Section[] = [
  {
    id: 'games',
    label: 'Games',
    Icon: IoGameControllerOutline,
    IconActive: IoGameController,
    component: Games
  },
  {
    id: 'collections',
    label: 'Collections',
    Icon: BsCollection,
    IconActive: BsCollectionFill,
    component: Collections
  },
  {
    id: 'stores',
    label: 'Stores',
    Icon: AiOutlineAppstore,
    IconActive: AiFillAppstore,
    component: Stores
  }
]

export interface SectionProps {
  isActive: boolean,
  onExit: () => void
  inputPriority?: number
}

export interface Section {
  component: (props: SectionProps) => ReactNode
  id: string;
  label: string;
  Icon: IconType;
  IconActive: IconType;
}

const Settings = () => {
  const [open, setOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");
  const [activeSection, setActiveSection] = useState(0);
  const [openedModal] = useAtom(openModalAtom);

  useEffect(() => {
    setActiveSide("left");
    setActiveSection(0);
  }, [open])

  useOnInput(
    (input) => {
      switch(input) {
        case Input.START: {
          console.log('running this')
          return setOpen(open => !open);
        }
      }
    },
    {
      bypass: !openedModal || openedModal === "settings-modal"
    }
  )

  useOnInput(
    (input) => {
      switch(input) {
        case Input.RIGHT: {
          return setActiveSide("right");
        }
        case Input.A: {
          if(activeSide === "left") setActiveSide("right");
          break;
        }
        case Input.B: {
          if(activeSide === "left") setOpen(false)
          break;
        }
      }
    },
    {
      priority: 10,
      disabled: !open
    }
  )

  const ActiveComponent = useMemo(() => sections[activeSection]?.component, [activeSection])

  return (
    <Modal open={open} id="settings-modal">
      <div className={css.body}>
        <div className={css.left}>
          <SectionSelector
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isActive={activeSide === "left"}
            inputPriority={10}
          />
        </div>
        <div className={classNames(css.right, (activeSide !== "right") && css.inactive)}>
          <ActiveComponent
            inputPriority={11}
            isActive={activeSide === "right"}
            onExit={() => setActiveSide("left") }
          />
        </div>
      </div>
    </Modal>
  )
}

export default Settings;
