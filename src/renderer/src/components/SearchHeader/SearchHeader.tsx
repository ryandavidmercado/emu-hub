import { useNavigate } from 'react-router-dom'
import { useInputModal } from '../InputModal/InputModal'
import { useAtom } from 'jotai'
import { useOnInput } from '@renderer/hooks'
import games from '@renderer/atoms/games'
import notifications from '@renderer/atoms/notifications'
import { Input } from '@renderer/enums/Input'
import css from './SearchHeader.module.scss'
import { IoMdSearch } from 'react-icons/io'
import { AnimatePresence, motion } from 'framer-motion'
import { InputPriority } from '@renderer/const/inputPriorities'
import { useState } from 'react'

const SearchHeader = () => {
  const [active, setActive] = useState(false)

  const getInput = useInputModal()
  const navigate = useNavigate()
  const [searchGames] = useAtom(games.lists.search)
  const [, addNotification] = useAtom(notifications.add)

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
      priority: InputPriority.HEADER_BAR_OPEN_CLOSE
    }
  )

  useOnInput(
    async (input) => {
      switch (input) {
        case Input.DOWN:
          setActive(false)
          break
        case Input.A: {
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

            setActive(false)
            break
          }

          navigate(`/games/search/${encodeURIComponent(query)}`)
          setActive(false)
          break
        }
        case Input.SELECT:
        case Input.B:
          setActive(false)
          break
      }
    },
    {
      disabled: !active,
      priority: InputPriority.HEADER_BAR
    }
  )

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3, transition: { duration: 0.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
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
            stiffness: 200,
            mass: 0.5,
            damping: 18
          }
        }}
        className={css.searchContainer}
      >
        <div className={css.searchbar}>
          Search Games
          <IoMdSearch />
        </div>
      </motion.div>
    </>
  )
}

export default SearchHeader
