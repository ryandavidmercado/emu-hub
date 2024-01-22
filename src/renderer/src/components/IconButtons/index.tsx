import { useOnInput } from "@renderer/hooks";
import { IconType } from "react-icons";
import css from "./IconButtons.module.scss";
import { useMemo, useState } from "react";
import { Input } from "@renderer/enums";
import classNames from "classnames";
import Label from "../Label/Label";
import { AnimatePresence, motion } from "framer-motion";
import { ColorScheme } from "../ControllerForm/ControllerForm";

interface Button {
  id: string
  Icon?: IconType
  IconActive?: IconType
  label?: string
  onHighlight?: () => void
  onSelect?: () => void
  className?: string
  iconClassName?: string
  disabled?: boolean;
  colorScheme?: ColorScheme;
}

interface Props {
  className?: string;
  buttons: Button[]
  isActive?: boolean;
  onExitDown?: () => void;
}

const IconButtons = ({ className, buttons, isActive, onExitDown }: Props) => {
  const [index, setIndex] = useState(0);
  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        return setIndex(i => Math.max(0, i - 1));
      case Input.RIGHT:
        return setIndex(i => Math.min(buttons.length - 1, i + 1));
      case Input.DOWN:
        onExitDown?.();
    }
  }, { disabled: !isActive })

  const buttonElements = buttons.map((button, i) => (
    <Button
      key={button.id}
      label={button.label}
      button={button}
      isActive={index === i}
      isParentActive={isActive}
    />
  ))

  return (
    <div className={classNames(css.buttons, !isActive && css.inactive, className)}>
      {buttonElements}
    </div>
  )
}

interface ButtonProps {
  isActive?: boolean
  label?: string
  button: Button
  isParentActive?: boolean;
}

const Button = ({ button, label, isActive, isParentActive }: ButtonProps) => {
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
    switch(input) {
      case Input.A:
        button.onSelect?.();
    }
  }, {
    disabled: !isParentActive || !isActive || button.disabled
  })

  return (
    <div className={css.buttonContainer}>
      <AnimatePresence initial={false}>
        {label && isActive && isParentActive &&
          <motion.div
            initial={{
              opacity: 0,
              scale: .5,
              y: -10
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            className={css.labelWrapper}
          >
            <Label
              className={classNames(css.label, button.disabled && css.disabled)}
              label={label}
            />
          </motion.div>
        }
      </AnimatePresence>

      <div className={classNames(
        css.button,
        isActive && css.active,
        button.disabled && css.disabled,
        css[button.colorScheme || "default"],
        button.className
      )}>
        {icon}
      </div>
    </div>
  )
}

export default IconButtons
