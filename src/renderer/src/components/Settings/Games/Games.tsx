import games from "@renderer/atoms/games"
import ControllerForm, { ControllerFormEntry } from "@renderer/components/ControllerForm/ControllerForm"
import { Input } from "@renderer/enums"
import { useOnInput } from "@renderer/hooks"
import { useAtom } from "jotai"
import { useMemo } from "react"
import { SectionProps } from ".."

const General = ({ isActive, onExit, inputPriority }: SectionProps) => {
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
      onSelect: scanRoms,
      sublabel: "Scan ROMs directory to populate missing game entries.",
      type: "action"
    },
  ], [])

  return <ControllerForm entries={entries} isActive={isActive} inputPriority={inputPriority} />
}

export default General;
