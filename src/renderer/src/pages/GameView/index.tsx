import games from '@renderer/atoms/games'
import { Input } from '@renderer/enums'
import { ControllerHint, focusAtom, useOnInput, useRecommendationScrollers } from '@renderer/hooks'
import { useAtom } from 'jotai'
import css from './GameView.module.scss'
import IconButtons, { IconButtonConfig } from '@renderer/components/IconButtons'

import {
  IoCloudDownload,
  IoCloudDownloadOutline,
  IoPlay,
  IoPlayOutline,
  IoSettings,
  IoSettingsOutline
} from 'react-icons/io5'
import { FaAngleDown } from 'react-icons/fa'

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
import EmuNotFound from '@renderer/components/EmuNotFoundModal/EmuNotFound'
import { Emulator } from '@common/types'
import systems from '@renderer/atoms/systems'
import { runningGameAtom } from '@renderer/atoms/runningGame'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import { hintsHeight } from '@renderer/const/const'
import { MdNotes } from 'react-icons/md'

const uid = new ShortUniqueId()

const GameView = ({ gameId }: { gameId?: string }) => {
  const [game, updateGame] = useAtom(games.single(gameId ?? ''))
  const [gameSystem] = useAtom(systems.single(game?.system ?? ''))

  const [, launchGame] = useAtom(games.launch)
  const [emuNotFoundOpen, setEmuNotFoundOpen] = useState(false)

  const [runningGame] = useAtom(runningGameAtom)
  const isInGame = Boolean(runningGame.game)

  const [appConfig] = useAtom(appConfigAtom)
  const { ui: { controllerHints } } = appConfig

  useEffect(() => {
    updateGame({
      lastViewed: new Date().toUTCString()
    })
  }, [])

  const [notificationsList] = useAtom(notifications.list)

  const [, addNotification] = useAtom(notifications.add)
  const [, removeNotification] = useAtom(notifications.remove)

  const [windowFocused] = useAtom(focusAtom)

  const [activeSection, setActiveSection] = useState<'game' | 'tabs'>('game')
  const containerRef = useRef<HTMLDivElement>(null)

  const [collectionModalOpen, setCollectionModalOpen] = useState(false)

  const [gameSettingsModalOpen, setGameSettingsModalOpen] = useState(false)
  const [failedLaunchEmulator, setFailedLaunchEmulator] = useState<Emulator>()

  const [scrapeModalOpen, setScrapeModalOpen] = useState(false)
  const selectedEmulator = game?.emulator ?? gameSystem?.emulators?.[0]


  const canScrape = !notificationsList.some(
    (notif) => notif.id.startsWith(`scrape-${game?.id}`) && notif.type === 'download'
  )

  const canPlay = !notificationsList.some(
    (notif) => notif.id === `install-emu-${selectedEmulator}`
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

  const hasInfo = Boolean(game?.description)
  const hasRecommendations = Boolean(recommendationScrollers.length)
  const hasBottom = hasInfo || hasRecommendations

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
      disabled: collectionModalOpen || isInGame,
      hints: [
        activeSection === "game" && game?.description && {
          input: Input.DOWN,
          text: recommendationScrollers.length
            ? "Game Info / Recommendations"
            : "Game Info"
        },
        { input: Input.B, text: activeSection === 'tabs' ? 'Game View' : 'Back' },
      ].filter(Boolean) as ControllerHint[]
    }
  )

  if (!game) {
    navigate(-1)
    return null
  }

  return (
    <div className={css.outerContainer}>
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

                    launchGame(game.id)
                      .then((res) => res.execInstance)
                      .catch((e) => {
                        removeNotification(notifId);
                        if(e.type === "emu-not-found") {
                          setFailedLaunchEmulator(e.data as Emulator);
                          setEmuNotFoundOpen(true);
                        } else {
                          addNotification({
                            text: `Failed to launch ${game.name ?? game.romname}`,
                            type: 'error'
                          });
                        }
                      })
                  },
                  disabled: isInGame || !canPlay
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
                hasBottom && {
                  id: 'info',
                  Icon: MdNotes,
                  IconActive: MdNotes,
                  label: hasInfo ? 'Info' : 'Recommendations',
                  onSelect: () => { setActiveSection("tabs") }
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
              ].filter(Boolean) as IconButtonConfig[]}
              className={css.buttons}
              isActive={activeSection === 'game' && !collectionModalOpen}
              onExitDown={onTabsSection}
            />
          </div>
          {hasBottom && (
            <FaAngleDown
              className={classNames(
                css.indicatorDown,
                activeSection !== 'game' && css.hidden,
                !windowFocused && css.noAnimate
              )}
              size="1.25em"
              style={{
                bottom: controllerHints ? `calc(${hintsHeight} + .5rem)` : '.5rem'
              }}
            />
          )}
        </div>
        {hasBottom && (
          <div className={classNames(css.tabsContainer, activeSection !== 'tabs' && css.inactive)}>
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
                  className: css.description,
                  isInvalid: !hasInfo
                },
                {
                  game,
                  id: 'recommendations',
                  label: 'Recommendations',
                  Content: Recommendations,
                  canSelect: true,
                  className: css.recommendations,
                  isInvalid: !hasRecommendations
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
        {failedLaunchEmulator &&
          <EmuNotFound
            open={emuNotFoundOpen}
            setOpen={setEmuNotFoundOpen}
            emulator={failedLaunchEmulator}
          />
        }
      </motion.div>
    </div>
  )
}

/* We use this to ensure that GameView re-renders when the active game changes */
export const GameViewWrapper = () => {
  const { gameId } = useParams()
  return <GameView gameId={gameId} key={gameId} />
}
