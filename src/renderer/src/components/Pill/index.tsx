import { IconType } from "react-icons";
import css from "./Pill.module.css"
import classNames from "classnames";

export default ({ Icon, label, className }: { Icon: IconType, label: string, className?: string }) => {
  return (
    <div className={classNames(className, css.pill)}>
      <Icon />
      {label}
    </div>
  );
}
