import { Input } from "@renderer/enums"
import { useOnInput } from "@renderer/hooks"
import classNames from "classnames";
import css from "./SectionSelector.module.scss"
import { Dispatch } from "react";
import { SetStateAction } from "jotai";
import { Section } from "..";

interface Props {
  activeSection: number,
  setActiveSection: Dispatch<SetStateAction<number>>,
  isActive: boolean
  sections: Section[]
  inputPriority?: number
}

const SectionSelector = ({ activeSection, setActiveSection, sections, isActive, inputPriority }: Props) => {
  useOnInput((input) => {
    switch(input) {
      case Input.UP:
        return setActiveSection(active =>
          active === 0 ? sections.length - 1 : active - 1
        )
      case Input.DOWN:
        return setActiveSection(active =>
          active === sections.length - 1 ? 0 : active + 1
        )
    }
  }, {
    disabled: !isActive,
    priority: inputPriority
  });

  return (
    <div className={classNames(css.sectionSelector, !isActive && css.inactive)}>
      {sections.map((section, i) => <SectionButton key={section.id} section={section} active={i === activeSection} />)}
    </div>
  );
}

interface SectionButtonProps {
  section: Section
  active: boolean
}

const SectionButton = ({ section, active }: SectionButtonProps) => {
  const Icon = active ? section.IconActive : section.Icon;
  return (
    <div
      // animate={{
      //   backgroundColor: active ? "hsla(40, 100%, 50%, 100%)" : "hsla(0, 0%, 0%, 0%)",
      //   // backgroundColor: active ? "hsla(0, 0%, 100%, 100%)" : "hsla(0, 0%, 0%, 0%)",
      //   color: active ? "hsl(200, 15%, 20%)" : "hsl(200, 0%, 100%)"
      //   // color: active ? "hsl(200, 15%, 20%)" : "hsl(200, 0%, 100%)"
      // }}
      // transition={{ duration: .15 }}
      className={classNames(css.sectionButton, active && css.active)}
    >
      <Icon />
      <div>{section.label}</div>
    </div>
  )
}

export default SectionSelector
