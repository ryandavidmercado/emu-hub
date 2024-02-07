import games from '@renderer/atoms/games'
import { Input } from '@renderer/enums'
import { focusAtom, useOnInput, useRecommendationScrollers } from '@renderer/hooks'
import { useAtom } from 'jotai'
import css from './GameView.module.scss'
import IconButtons from '@renderer/components/IconButtons'

import {
  IoCloudDownload,
  IoCloudDownloadOutline,
  IoPlay,
  IoPlayOutline,
  IoSettings,
  IoSettingsOutline
} from 'react-icons/io5'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'

import { FaPlus } from 'react-icons/fa6'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import TabSelector from '@renderer/components/TabSelector/TabSelector'
import { motion } from 'framer-motion'
import GameInfo from './GameInfo/GameInfo'
import Recommendations from './Recommendations/Recommendations'
import CollectionModal from '@renderer/components/CollectionModal/CollectionModal'
import notifications from '@renderer/atoms/notifications'
import ShortUniqueId from 'short-unique-id'
import GameSettingsModal from '@renderer/components/GameSettingsModal/GameSettingsModal'
import MediaImage from '@renderer/components/MediaImage/MediaImage'
import ScrapeModal from '@renderer/components/ScrapeModal/ScrapeModal'

const uid = new ShortUniqueId()

const GameView = ({ gameId }: { gameId?: string }) => {
  const [game, updateGame] = useAtom(games.single(gameId ?? ''))
  const [, launchGame] = useAtom(games.launch)

  useEffect(() => {
    updateGame({
      lastViewed: new Date().toUTCString()
    })
  }, [])

  const [notificationsList] = useAtom(notifications.list)
  const [, addNotification] = useAtom(notifications.add)
  const [, updateNotification] = useAtom(notifications.update)

  const [windowFocused] = useAtom(focusAtom)

  const [activeSection, setActiveSection] = useState<'game' | 'tabs'>('game')
  const [isInGame, setIsInGame] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [collectionModalOpen, setCollectionModalOpen] = useState(false)
  const [gameSettingsModalOpen, setGameSettingsModalOpen] = useState(false)
  const [scrapeModalOpen, setScrapeModalOpen] = useState(false)

  const canScrape = !notificationsList.some(
    (notif) => notif.id.startsWith(`scrape-${game?.id}`) && notif.type === 'download'
  )

  const onGameSection = () => {
    setActiveSection('game')
  }

  const onTabsSection = () => {
    if (!game?.description) return
    if (isInGame) return

    setActiveSection('tabs')
  }

  const navigate = useNavigate()
  const recommendationScrollers = useRecommendationScrollers(game)

  useOnInput(
    (input) => {
      switch (input) {
        case Input.B:
          if (activeSection === 'tabs') {
            return setActiveSection('game')
          }
          return navigate(-1)
      }
    },
    {
      disabled: collectionModalOpen
    }
  )

  if (!game) {
    navigate(-1)
    return null
  }

  return (
    <motion.div
      animate={{
        translateY: activeSection === 'tabs' ? '-101vh' : 0,
        transition: {
          type: 'spring',
          mass: 0.4,
          damping: 12
        }
      }}
      className={css.container}
      ref={containerRef}
    >
      <div className={css.upperContainer}>
        <MediaImage
          media={game.gamePageDisplayType === 'fanart' ? game.hero : game.screenshot}
          className={css.bg}
        />
        <div className={css.buttonsAndLogo}>
          <MediaImage media={game.logo} className={css.logo}>
            <div className={css.name}>{game.name || game.romname}</div>
          </MediaImage>
          <IconButtons
            buttons={[
              {
                id: 'play',
                Icon: IoPlayOutline,
                IconActive: IoPlay,
                label: 'Play',
                onSelect: () => {
                  const notifId = uid.rnd()
                  addNotification({
                    id: notifId,
                    text: `Launching ${game.name ?? game.romname} ...`,
                    type: 'info'
                  })

                  setIsInGame(true)
                  launchGame(game.id)
                    .catch(() => {
                      updateNotification({
                        id: notifId,
                        text: `Failed to launch ${game.name ?? game.romname}`,
                        type: 'error'
                      })
                    })
                    .finally(() => {
                      setIsInGame(false)
                    })
                },
                disabled: isInGame
              },
              {
                id: 'add-to-collection',
                Icon: FaPlus,
                label: 'Add to Collection',
                onSelect: () => {
                  setCollectionModalOpen(true)
                },
                disabled: isInGame,
                colorScheme: 'confirm'
              },
              {
                id: 'settings',
                Icon: IoSettingsOutline,
                IconActive: IoSettings,
                label: 'Settings',
                onSelect: () => {
                  setGameSettingsModalOpen(true)
                },
                disabled: isInGame
              },
              {
                id: 'scrape',
                Icon: IoCloudDownloadOutline,
                IconActive: IoCloudDownload,
                label: 'Scrape',
                onSelect: () => {
                  setScrapeModalOpen(true)
                },
                disabled: isInGame || !canScrape
              }
            ]}
            className={css.buttons}
            isActive={activeSection === 'game' && !collectionModalOpen}
            onExitDown={onTabsSection}
          />
        </div>
        {game.description && (
          <FaAngleDown
            className={classNames(
              css.indicatorDown,
              activeSection !== 'game' && css.hidden,
              !windowFocused && css.noAnimate
            )}
          />
        )}
      </div>
      {game.description && (
        <div className={classNames(css.tabsContainer, activeSection !== 'tabs' && css.inactive)}>
          <div className={css.indicatorUpWrapper}>
            <FaAngleUp className={classNames(css.indicatorUp, !windowFocused && css.noAnimate)} />
          </div>
          <TabSelector
            tabsClassName={css.tabs}
            disabled={activeSection !== 'tabs'}
            onExitUp={onGameSection}
            tabs={[
              {
                game,
                id: 'info',
                label: 'Info',
                Content: GameInfo,
                className: css.description
              },
              {
                game,
                id: 'recommendations',
                label: 'Recommendations',
                Content: Recommendations,
                canSelect: true,
                className: css.recommendations,
                isInvalid: !recommendationScrollers.length
              }
            ]}
          />
        </div>
      )}
      <CollectionModal open={collectionModalOpen} setOpen={setCollectionModalOpen} game={game} />
      <GameSettingsModal
        open={gameSettingsModalOpen}
        setOpen={setGameSettingsModalOpen}
        game={game}
      />
      <ScrapeModal open={scrapeModalOpen} setOpen={setScrapeModalOpen} game={game} />
    </motion.div>
  )
}

/* We use this to ensure that GameView re-renders when the active game changes */
export const GameViewWrapper = () => {
  const { gameId } = useParams()
  return <GameView gameId={gameId} key={gameId} />
}
