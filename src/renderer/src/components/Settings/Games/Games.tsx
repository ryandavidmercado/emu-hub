import games from "@renderer/atoms/games"
import { useAtom } from "jotai"
import { useMemo } from "react"
import { SectionProps } from ".."
import { GrScan } from "react-icons/gr";
import MultiPageControllerForm, { MultiFormPage } from "@renderer/components/ControllerForm/MultiPage"
import notifications from "@renderer/atoms/notifications";

const General = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [, scanRoms] = useAtom(games.scan)
  const [, addNotification] = useAtom(notifications.add);

  const pages = useMemo<MultiFormPage[]>(() => [
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
          id: 'test',
          type: 'navigate',
          label: "Scrape Settings",
          navigateTo: "scrape-settings"
        }
      ]
    },
    {
      id: 'scrape-settings',
      entries: [
        {
          id: 'test',
          type: 'toggle',
          label: "Toggle",
          enabled: true,
          setEnabled: () => undefined
        }
      ]
    }
  ], [])

  return <MultiPageControllerForm
    pages={pages}
    active={isActive}
    inputPriority={inputPriority}
    onExitLeft={onExit}
    onExitBack={onExit}
  />
}

export default General;
