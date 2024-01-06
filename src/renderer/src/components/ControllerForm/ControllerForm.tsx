import { IconType } from "react-icons"
import css from "./ControllerForm.module.scss";
import { useState } from "react";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import classNames from "classnames";

export type FormEntry = {
  id: string,
  label: string,
  Icon?: IconType
  IconActive?: IconType
} & ({
  type: "action",
  onSelect: (id: string) => void
} | {
  type: "toggle"
  enabled: boolean,
  setEnabled: (enabled: boolean) => void
})

interface Props {
  entries: FormEntry[],
  isActive: boolean
}

const ControllerForm = ({ entries, isActive }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEntry = entries[activeIndex];

  const onSelect = () => {
    switch(activeEntry.type) {
      case "action":
        activeEntry.onSelect(activeEntry.id);
        break;
      case "toggle":
        break;
    }
  }

  useOnInput((input) => {
    switch(input) {
      case Input.A:
        onSelect();
        break;
      case Input.DOWN:
        setActiveIndex((i) => Math.min(i + 1, entries.length - 1))
        break;
      case Input.UP:
        setActiveIndex((i) => Math.max(i - 1, 0))
        break;
    }
  }, {
    parentCaptureKeys: ["settings-modal"],
    disabled: !isActive
  })

  return (
    <div className={css.controllerForm}>
      {entries.map((entry, i) => (
        <div className={classNames(css.entry, (i === activeIndex) && css.active)}>
          <div>{entry.label}</div>
        </div>
      ))}
    </div>
  )
}

export default ControllerForm
