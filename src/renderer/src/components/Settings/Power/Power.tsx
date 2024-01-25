import { SectionProps } from "..";
import MultiPageControllerForm, { MultiFormPage } from "@renderer/components/ControllerForm/MultiPage";
import { IoExitOutline } from "react-icons/io5";

const Power = ({ onExit, inputPriority, isActive }: SectionProps) => {
  const pages: MultiFormPage[] = [
    {
      id: 'main',
      entries: [
        {
          id: 'exit',
          label: "Exit EmuHub",
          type: "action",
          Icon: IoExitOutline,
          onSelect: () => { window.close() }
        }
      ]
    }
  ]

  return (
    <MultiPageControllerForm
      pages={pages}
      inputPriority={inputPriority}
      active={isActive}
      onExitBack={onExit}
      onExitLeft={onExit}
    />
  )
}

export default Power
