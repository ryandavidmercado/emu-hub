import games from "@renderer/atoms/games"
import ControllerForm, { ControllerFormEntry } from "@renderer/components/ControllerForm/ControllerForm"
import { Input } from "@renderer/enums"
import { useOnInput } from "@renderer/hooks"
import { useAtom } from "jotai"
import { useMemo } from "react"
import { SectionProps } from ".."
import { GrScan } from "react-icons/gr";

const General = ({ isActive, onExit, inputPriority, onExitModal }: SectionProps) => {
  const [, scanRoms] = useAtom(games.scan)

  useOnInput((input) => {
    switch(input) {
      case Input.B:
      case Input.LEFT:
        onExit();
    }
  }, {
    disabled: !isActive,
    priority: inputPriority
  })

  const entries = useMemo<ControllerFormEntry[]>(() => [
    {
      id: 'scan-roms',
      label: "Rescan ROMs",
      onSelect: () => {
        scanRoms();
        onExitModal();
      },
      sublabel: "Scan ROMs directory to populate missing game entries.",
      type: "action",
      Icon: GrScan
    },
  ], [])

  return <ControllerForm
    entries={entries}
    isActive={isActive}
    inputPriority={inputPriority}
  />
}

export default General;
