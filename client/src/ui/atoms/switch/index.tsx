import { ReactChildren } from "react";
import "./index.scss";

export function Switch({
  name,
  extraClasses,
  hiddenLabel,
  checked = false,
  toggle = () => {},
  children,
}: {
  name: string;
  extraClasses?: string;
  hiddenLabel?: string;
  checked?: boolean;
  toggle?: (Event) => void;
  children?: string | ReactChildren;
}) {
  return (
    <label className={extraClasses ? `switch ${extraClasses}` : "switch"}>
      {hiddenLabel && <span className="visually-hidden">{hiddenLabel}</span>}
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={toggle}
      ></input>
      <span className="slider"></span>
      {children && <span className="label">{children}</span>}
    </label>
  );
}
