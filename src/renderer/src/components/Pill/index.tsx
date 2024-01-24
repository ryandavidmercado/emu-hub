import { IconType } from "react-icons";
import css from "./Pill.module.scss"
import classNames from "classnames";

export interface PillType {
  Icon: IconType,
  text: string
  id: string
}

export default ({ Icon, label, className }: { Icon: IconType, label: string, className?: string }) => {
  return (
    <div className={classNames(className, css.pill)}>
      <Icon />
      {label}
    </div>
  );
}
