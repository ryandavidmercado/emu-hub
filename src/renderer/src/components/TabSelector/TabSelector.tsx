import classNames from "classnames";
import { useMemo, useState } from "react";
import css from "./TabSelector.module.scss";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import { Game } from "@renderer/atoms/games";

export interface TabContentProps {
  className?: string;
  onExitUp?: () => void;
  isDisabled?: boolean;
  game?: Game;
}

interface Tab {
  id: string;
  label: string;
  Content?: (props: TabContentProps) => JSX.Element | null
  canSelect?: boolean;
  game?: Game;
  className?: string;
  isInvalid?: boolean;
}

interface Props {
  tabsClassName?: string;
  contentInactiveClassName?: string;
  tabs: Tab[]
  disabled?: boolean;
  onExitUp?: () => void;
  onExitDown?: () => void;
}

const TabSelector = ({ tabsClassName, tabs: unfilteredTabs, disabled, onExitUp }: Props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSection, setActiveSection] = useState<"tabs" | "content">("tabs");

  const tabs = useMemo(() => {
    return unfilteredTabs.filter(tab => !tab.isInvalid)
  }, [unfilteredTabs]);

  console.log(unfilteredTabs, tabs)

  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        return setActiveTab(tab => Math.max(tab - 1, 0));
      case Input.RIGHT:
        return setActiveTab(tab => Math.min(tab + 1, tabs.length - 1));
      case Input.UP:
        return onExitUp?.();
      case Input.DOWN:
        if(tabs[activeTab].canSelect) setActiveSection("content");
    }
  }, {
    disabled: disabled || activeSection !== "tabs"
  })

  const Content = tabs[activeTab].Content;

  return (
    <div className={css.container}>
      <div className={classNames(css.tabs, tabsClassName, activeSection !== "tabs" && css.inactive)}>
        {tabs.map((tab, i) => (
          <div key={tab.id} className={classNames(css.tab, i === activeTab && css.active)}>
            {tab.label}
          </div>
        ))}
      </div>
      {Content && <Content
        game={tabs[activeTab].game}
        isDisabled={activeSection !== "content"}
        onExitUp={() => { setActiveSection("tabs") }}
        className={classNames(
          tabs[activeTab].className,
          css.opacityTransition,
          tabs[activeTab].canSelect && activeSection !== "content" && css.inactive
        )}
      />}
    </div>
  )
}

export default TabSelector
