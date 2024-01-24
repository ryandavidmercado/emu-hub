import games from "@renderer/atoms/games"
import { useAtom } from "jotai"
import { useState } from "react"
import { SectionProps } from ".."
import { GrScan } from "react-icons/gr";
import MultiPageControllerForm, { MultiFormPage } from "@renderer/components/ControllerForm/MultiPage"
import notifications from "@renderer/atoms/notifications";
import screenScraperAtom from "@renderer/atoms/screenscaper";
import { IoCloudDownload } from "react-icons/io5";

const General = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [, scanRoms] = useAtom(games.scan)
  const [, addNotification] = useAtom(notifications.add);
  const [ssCredentials, setSsCrendentials] = useAtom(screenScraperAtom)

  const [includeWithMedia, setIncludeWithMedia] = useState(false);
  const [, scrapeAllGames] = useAtom(games.scrapeAll);

  const pages: MultiFormPage[] = [
    {
      id: 'base',
      entries: [
        {
          id: 'scan-roms',
          label: "Rescan ROMs",
          onSelect: () => {
            scanRoms();
            addNotification({
              type: 'success',
              text: "Done scanning ROMs!",
              timeout: 2
            })
          },
          sublabel: "Scan ROMs directory to populate missing game entries.",
          type: "action",
          Icon: GrScan
        },
        {
          id: 'scrape',
          label: "Scrape Games",
          type: "navigate",
        }
      ]
    },
    {
      id: 'scrape',
      entries: [
        {
          id: 'scrape-settings',
          type: 'navigate',
          label: "ScreenScraper Credentials",
          navigateTo: "scrape-credentials"
        },
        {
          id: 'scrape-missing',
          type: 'toggle',
          label: "Include Games With Scraped Media",
          sublabel: "Set to true to scrape games that already have media loaded.",
          enabled: includeWithMedia,
          setEnabled: setIncludeWithMedia
        },
        {
          id: 'scrape',
          type: 'action',
          colorScheme: "confirm",
          label: "Start Scraping",
          Icon: IoCloudDownload,
          onSelect: () => {
            scrapeAllGames({
              excludeNotMissing: !includeWithMedia
            })
          }
        }
      ]
    },
    {
      id: 'scrape-credentials',
      entries: [
        {
          id: 'ss-username',
          type: 'input',
          label: "ScreenScraper Username",
          sublabel: ssCredentials.username ? `Current: ${ssCredentials.username}` : undefined,
          defaultValue: ssCredentials.username,
          onInput: (input) => {
            setSsCrendentials(cred => ({ ...cred, username: input }))
          },
        },
        {
          id: 'ss-password',
          type: 'input',
          label: "ScreenScraper Password",
          sublabel: ssCredentials.password
            ? `Current: ${ssCredentials.password.split("").map(() => "*").join("")}`
            : undefined,
          defaultValue: ssCredentials.password,
          isPassword: true,
          onInput: (input) => {
            setSsCrendentials(cred => ({ ...cred, password: input }))
          }
        },
      ]
    }
  ]

  return <MultiPageControllerForm
    pages={pages}
    active={isActive}
    inputPriority={inputPriority}
    onExitLeft={onExit}
    onExitBack={onExit}
  />
}

export default General;
