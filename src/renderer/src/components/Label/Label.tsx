import classNames from "classnames";
import css from "./Label.module.scss";

const Label = ({ className, label, sublabel }: {
  label: string,
  sublabel?: string
  className?: string
}) => {
  return (
    <div className={classNames(css.label, className)}>
      {label}
      {sublabel && <span> - {sublabel}</span>}
    </div>
  )
}

export default Label;
