import { useLocation, useNavigate } from 'react-router-dom'
import { useInputModal } from '../InputModal/InputModal'
import { useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import games from '@renderer/atoms/games'
import notifications from '@renderer/atoms/notifications'
import { Input } from '@renderer/enums/Input'
import css from './NavHeader.module.scss'
import { IoMdSearch } from 'react-icons/io'
import { AnimatePresence, motion } from 'framer-motion'
import { InputPriority } from '@renderer/const/inputPriorities'
import { useEffect, useMemo, useState } from 'react'
import { IoGameController, IoHome } from 'react-icons/io5'
import classNames from 'classnames'
import { IconType } from 'react-icons'

const NavHeader = () => {
  const [active, setActive] = useState(false)
  const [selected, setSelected] = useState(0);

  const navigate = useNavigate()
  const location = useLocation();

  const getInput = useInputModal()
  const [searchGames] = useAtom(games.lists.search)
  const [, addNotification] = useAtom(notifications.add)


  type Entry = {
    id: string,
    text: string,
    Icon: IconType
  } & ({
    handler: () => void | Promise<void>
  } | {
    route: string
  })

  const entries: Entry[] = useMemo(() => [
    {
      id: 'home',
      text: "Home",
      Icon: IoHome,
      route: "/home"
    },
    {
      id: 'all',
      text: "All Games",
      Icon: IoGameController,
      route: "/games/all"
    },
    {
      id: 'search',
      handler: async () => {
        const query = await getInput({
          label: 'Search Games',
          shiftOnOpen: false,
          shiftOnSpace: false
        })

        if (!query) {
          setActive(false)
          return
        }

        const hits = searchGames(query).length
        if (!hits) {
          addNotification({
            text: `No results for "${query}"!`,
            type: 'info',
            timeout: 1.5
          })

          return;
        }

        navigate(`/games/search/${encodeURIComponent(query)}`)
      },
      text: "Search Games",
      Icon: IoMdSearch
    },
  ], [])

  useEffect(() => {
    if(!active) return;
    setSelected(() => {
      let routeIndex = entries.findIndex(entry => "route" in entry && entry.route === location.pathname);
      if(routeIndex === -1) routeIndex = entries.findIndex(entry => "handler" in entry);

      return Math.max(routeIndex, 0);
    })
  }, [active, location, entries])


  useOnInput(
    (input) => {
      switch (input) {
        case Input.SELECT: {
          setActive(!active)
        }
      }
    },
    {
      enforcePriority: false,
      priority: InputPriority.HEADER_BAR_OPEN_CLOSE,
      hints: [
        { input: Input.SELECT, text: 'Navigation Menu' }
      ]
    }
  )

  useOnInput(
    async (input) => {
      switch (input) {
        case Input.LEFT:
          setSelected((s) => Math.max(0, s - 1));
          break;
        case Input.RIGHT:
          setSelected((s) => Math.min(entries.length - 1, s + 1));
          break;
        case Input.DOWN:
          setActive(false)
          break
        case Input.A: {
          const activeEntry = entries[selected];

          if("handler" in activeEntry) {
            await activeEntry.handler?.();
          }
          if("route" in activeEntry) {
            navigate(activeEntry.route);
          }

          setActive(false);
          break;
        }
        case Input.SELECT:
        case Input.B:
          setActive(false)
          break
      }
    },
    {
      disabled: !active,
      priority: InputPriority.HEADER_BAR,
      hints: [
        { input: Input.A, text: 'Select' },
        { input: Input.B, text: 'Close Navigation' }
      ]
    }
  )

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className={css.bgOverlay}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{
          y: active ? 0 : -100,
          transition: {
            type: 'spring',
            stiffness: 230,
            mass: 0.5,
            damping: 18,
            delay: .05
          }
        }}
        className={css.navContainer}
      >
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            className={classNames(
              css.navEntry,
              i === selected && css.active
            )}
            animate={{
              padding: `${i === selected ? "27px" : "20px"} 25px`,
              transition: {
                type: 'spring',
                stiffness: 280,
                mass: .2
              }
            }}
          >
            {entry.text}
            <entry.Icon />
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}

export default NavHeader
