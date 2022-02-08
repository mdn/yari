import React from "react";
import { Icon } from "../../../atoms/icon";

type WatchMenuItemProps = {
  value: string;
  checked: boolean;
  label: string;
  text?: string;
  onClickHandler?: React.MouseEventHandler;
};

export function WatchMenuItem({
  value,
  onClickHandler,
  checked,
  label,
  text,
}: WatchMenuItemProps) {
  return (
    <button
      role="menuitemradio"
      aria-checked={checked}
      className={`watch-submenu-button is-${value}`}
      value={value}
      onClick={onClickHandler}
    >
      <span className="watch-submenu-button-wrap">
        {checked && (
          <span className="watch-submenu-button-status">
            <Icon name="checkmark" />
          </span>
        )}

        <span className="watch-submenu-button-label">{label}</span>
        {text && <span className="watch-submenu-button-text">{text}</span>}
      </span>
    </button>
  );
}
