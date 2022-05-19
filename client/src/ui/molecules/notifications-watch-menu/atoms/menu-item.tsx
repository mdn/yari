// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../../atoms/icon'. Did you ... Remove this comment to see the full error message
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
