import games from "@renderer/atoms/games"
import ControllerForm, { FormEntry } from "@renderer/components/ControllerForm/ControllerForm"
import { useAtom } from "jotai"
import { useMemo } from "react"

const Games = ({ isActive }: { isActive: boolean }) => {
  const [, scanRoms] = useAtom(games.scan)
  const entries = useMemo<FormEntry[]>(() => [
    {
      id: 'scan-roms',
      label: "Rescan ROMs",
      onSelect: scanRoms,
      type: "action"
    },
    {
      id: 'scan-roms-2',
      label: "Scan ROMs",
      onSelect: scanRoms,
      type: "action"
    }
  ], [])

  return <ControllerForm entries={entries} isActive={isActive} />
}

export default Games;
