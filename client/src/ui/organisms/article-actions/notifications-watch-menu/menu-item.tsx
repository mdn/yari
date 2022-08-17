import React from "react";
import { Icon } from "../../../atoms/icon";

import "./menu-item.scss";

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
      className="watch-menu-item"
      value={value}
      onClick={onClickHandler}
    >
      <span className="watch-menu-item-inner">
        {checked && (
          <span className="watch-menu-item-status">
            <Icon name="checkmark" />
          </span>
        )}

        <span className="watch-menu-item-label">{label}</span>
        {text && <span className="watch-menu-item-text">{text}</span>}
      </span>
    </button>
  );
}
