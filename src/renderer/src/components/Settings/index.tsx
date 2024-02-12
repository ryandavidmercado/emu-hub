import { Input } from '@renderer/enums'
import { ControllerHint, useOnInput } from '@renderer/hooks'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import css from './Settings.module.scss'
import SectionSelector from './SectionSelector'
import Games from './Games/Games'
import classNames from 'classnames'
import Stores from './Stores/Stores'

import { IconType } from 'react-icons'
import { IoGameController, IoGameControllerOutline, IoPower, IoPowerOutline } from 'react-icons/io5'
import { AiOutlineAppstore, AiFillAppstore } from 'react-icons/ai'
import { BsCollection, BsCollectionFill } from 'react-icons/bs'
import Modal from '../Modal/Modal'
import Collections from './Collections/Collections'
import Power from './Power/Power'
import { eventHandler } from '@renderer/eventHandler'
import { atom, useAtom } from 'jotai'
import { InputPriority } from '@renderer/const/inputPriorities'
import { MdFeaturedPlayList, MdOutlineFeaturedPlayList } from 'react-icons/md'
import Interface from './Interface/Interface'

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
  },
  {
    id: 'ui',
    label: 'Interface',
    Icon: MdOutlineFeaturedPlayList,
    IconActive: MdFeaturedPlayList,
    component: Interface
  },
  {
    id: 'power',
    label: 'Power',
    Icon: IoPowerOutline,
    IconActive: IoPower,
    component: Power
  }
]

export interface SectionProps {
  isActive: boolean
  onExit: () => void
  inputPriority?: number
  onExitModal: () => void
}

export interface Section {
  component: (props: SectionProps) => ReactNode
  id: string
  label: string
  Icon: IconType
  IconActive: IconType
}

const openAtom = atom(false)
export const settingsOpenAtom = atom((get) => get(openAtom)) // export readonly

const Settings = () => {
  const [open, setOpen] = useAtom(openAtom)
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left')
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    if (!open) {
      setActiveSide('left')
      setActiveSection(0)
    }
  }, [open])

  useEffect(() => {
    const unbind = eventHandler.on('settings-jump-to-section', (section: number) => {
      setActiveSide('right')
      setActiveSection(section)
      setOpen(true)
    })

    return () => {
      unbind()
    }
  }, [])

  useOnInput(
    (input) => {
      switch (input) {
        case Input.START: {
          if (open) eventHandler.emit('settings-close')
          return setOpen((open) => !open)
        }
      }
    },
    {
      priority: InputPriority.SETTINGS_MODAL_OPEN_CLOSE,
      enforcePriority: false,
      hints: [
        !open && { input: Input.START, text: "Settings Menu" }
      ].filter(Boolean) as ControllerHint[]
    }
  )

  useOnInput(
    (input) => {
      switch (input) {
        case Input.RIGHT: {
          return setActiveSide('right')
        }
        case Input.A: {
          if (activeSide === 'left') setActiveSide('right')
          break
        }
        case Input.B: {
          if (activeSide === 'left') {
            eventHandler.emit('settings-close')
            setOpen(false)
          }
          break
        }
      }
    },
    {
      priority: InputPriority.SETTINGS_MODAL,
      disabled: !open,
      hints: [
        activeSide === "left" && { input: Input.B, text: "Close Settings" },
        activeSide === "left" && { input: Input.A, text: "Select Section" },
        activeSide === "right" && { input: Input.B, text: "Back" }
      ].filter(Boolean) as ControllerHint[]
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
            isActive={activeSide === 'left'}
            inputPriority={InputPriority.SETTINGS_MODAL}
          />
        </div>
        <div className={classNames(css.right, activeSide !== 'right' && css.inactive)}>
          <ActiveComponent
            inputPriority={InputPriority.SETTINGS_MODAL}
            isActive={activeSide === 'right'}
            onExit={() => setActiveSide('left')}
            onExitModal={() => setOpen(false)}
          />
        </div>
      </div>
    </Modal>
  )
}

export default Settings
