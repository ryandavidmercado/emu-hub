import games from '@renderer/atoms/games'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { SectionProps } from '..'
import { GrScan } from 'react-icons/gr'
import MultiPageControllerForm, {
  MultiFormPage
} from '@renderer/components/ControllerForm/MultiPage'
import notifications from '@renderer/atoms/notifications'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import { IoCloudDownload } from 'react-icons/io5'
import { scrapers } from '@renderer/const/scrapers'
import { ControllerFormEntry } from '@renderer/components/ControllerForm/ControllerForm'

const General = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [, scanRoms] = useAtom(games.scan)
  const [, addNotification] = useAtom(notifications.add)
  const [appConfig, updateAppConfig] = useAtom(appConfigAtom)

  const [includeWithMedia, setIncludeWithMedia] = useState(false)
  const [, scrapeAllGames] = useAtom(games.scrapeAll)
  const [scraper, setScraper] = useState<string>(scrapers[0].id)

  const [scrapeBy, setScrapeBy] = useState('rom')

  const pages: MultiFormPage[] = [
    {
      id: 'base',
      entries: [
        {
          id: 'scan-roms',
          label: 'Rescan ROMs',
          onSelect: async () => {
            await scanRoms()
            addNotification({
              type: 'success',
              text: 'Done scanning ROMs!',
              timeout: 2
            })
          },
          sublabel: 'Scan ROMs directory to populate missing game entries.',
          type: 'action',
          Icon: GrScan
        },
        // electron doesn't get background gamepad input on MacOS
        window.platform !== "darwin" && {
          id: 'enable-quit',
          label: "Enable Quit Game Shortcut",
          sublabel: "Hold LT + RT + UP + Y while in-game to exit back to EmuHub.",
          type: 'toggle',
          enabled: appConfig.game.enableQuitShortcut,
          setEnabled: (e: boolean) => { updateAppConfig((config) => { config.game.enableQuitShortcut = e })}
        },
        {
          id: 'scrape',
          label: 'Scrape Games',
          type: 'navigate'
        }
      ].filter(Boolean) as ControllerFormEntry[]
    },
    {
      id: 'scrape',
      entries: [
        {
          id: 'ss-credentials',
          type: 'navigate',
          label: 'ScreenScraper Credentials',
          navigateTo: 'ss-credentials'
        },
        {
          id: 'select-scraper',
          type: 'selector',
          label: 'Scraping Service',
          options: [...scrapers],
          value: scraper,
          onSelect: (id) => {
            setScraper(id)
          },
          wraparound: true
        },
        {
          id: 'scrape-by',
          type: 'selector',
          label: 'Scrape By:',
          options: [
            { id: 'rom', label: 'ROM Info (Name, Size, CRC)' },
            { id: 'name', label: 'Game Name' }
          ],
          onSelect: (id) => setScrapeBy(id),
          wraparound: true,
          value: scrapeBy
        },
        {
          id: 'scrape-missing',
          type: 'toggle',
          label: 'Include Games With Scraped Media',
          sublabel: 'Set to true to scrape games that already have media loaded.',
          enabled: includeWithMedia,
          setEnabled: setIncludeWithMedia
        },
        {
          id: 'scrape',
          type: 'action',
          colorScheme: 'confirm',
          label: 'Start Scraping',
          Icon: IoCloudDownload,
          onSelect: () => {
            scrapeAllGames({
              excludeNotMissing: !includeWithMedia,
              scrapeBy: scrapeBy as 'name' | 'rom' | undefined,
              scraper: scraper as 'screenscraper' | 'igdb' | undefined
            })
          }
        }
      ]
    },
    {
      id: 'ss-credentials',
      entries: [
        {
          id: 'ss-username',
          type: 'input',
          label: 'ScreenScraper Username',
          sublabel: appConfig.credentials.screenscraper.username
            ? `Current: ${appConfig.credentials.screenscraper.username}`
            : undefined,
          defaultValue: appConfig.credentials.screenscraper.username,
          onInput: (input) => {
            updateAppConfig((config) => { config.credentials.screenscraper.username = input })
          }
        },
        {
          id: 'ss-password',
          type: 'input',
          label: 'ScreenScraper Password',
          sublabel: appConfig.credentials.screenscraper.password
            ? `Current: ${appConfig.credentials.screenscraper.password
                .split('')
                .map(() => '*')
                .join('')}`
            : undefined,
          defaultValue: appConfig.credentials.screenscraper.password,
          isPassword: true,
          onInput: (input) => {
            updateAppConfig((config) => { config.credentials.screenscraper.password = input })
          }
        }
      ]
    }
  ]

  return (
    <MultiPageControllerForm
      pages={pages}
      active={isActive}
      inputPriority={inputPriority}
      onExitLeft={onExit}
      onExitBack={onExit}
    />
  )
}

export default General
