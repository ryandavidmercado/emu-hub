import { useOnInput } from "@renderer/hooks";
import { IconType } from "react-icons";
import css from "./IconButtons.module.scss";
import { useMemo, useState } from "react";
import { Input } from "@renderer/enums";
import classNames from "classnames";

interface Button {
  id: string
  Icon?: IconType
  IconActive?: IconType
  label?: string
  onHighlight?: () => void
  onSelect?: () => void
  className?: string
  iconClassName?: string
}

interface Props {
  buttons: Button[]
}

const IconButtons = ({ buttons }: Props) => {
  const [activeButton, setActiveButton] = useState(0);

  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        return setActiveButton(i => Math.max(0, i - 1));
      case Input.RIGHT:
        return setActiveButton(i => Math.min(buttons.length - 1, i + 1));
    }
  })

  const buttonElements = buttons.map((button, i) => (
    <Button
      key={button.id}
      button={button}
      isActive={activeButton === i}
    />
  ))

  return (
    <div className={css.buttons}>
      {buttonElements}
    </div>
  )
}

interface ButtonProps {
  isActive?: boolean
  button: Button
}

const Button = ({ button, isActive }: ButtonProps) => {
  const icon = useMemo(() => {
    const iconOrNull = (Icon?: IconType) => {
      return Icon
        ? <Icon className={button.iconClassName} />
        : null
    }

    return isActive
      ? iconOrNull(button.IconActive) ?? iconOrNull(button.Icon)
      : iconOrNull(button.Icon)
  }, [isActive, button])

  useOnInput((input) => {
    if(!isActive) return;

    switch(input) {
      case Input.A:
        button.onSelect?.();
    }
  })

  return (
    <div className={classNames(css.button, isActive && css.active, button.className )}>
      {icon}
    </div>
  )
}

export default IconButtons
