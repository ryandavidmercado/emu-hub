import { IconType } from "react-icons";
import css from "./Pill.module.css"

export default ({ Icon, label }: { Icon: IconType, label: string }) => {
  return (
    <div className={css.pill}>
      <Icon />
      {label}
    </div>
  );
}
