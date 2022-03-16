import React from "react";
import { useLocale } from "../../../hooks";
import { Button } from "../../atoms/button";
import { Icon } from "../../atoms/icon";
import { DropdownMenu } from "../dropdown";

export function ManageOrUpgradeDialog({ show, setShow }) {
  const locale = useLocale();

  return (
    <DropdownMenu>
      <div
        className={`watch-submenu show`}
        role="menu"
        aria-labelledby={`watch-submenu-button`}
      >
        <div className="manage-dialog">
          <button
            onClick={() => setShow(false)}
            className="watch-submenu-header mobile-only"
          >
            <span className="watch-submenu-header-wrap">
              <Icon name="chevron" />
              Back
            </span>
          </button>
          <p>You've used all your remaining saves.</p>
          <p>
            Managed your collection or upgrade to MDN Plus to unlock unlimited
            saves
          </p>
          <div className="watch-submenu-item is-button-row">
            <Button type="secondary" href={`/${locale}/plus/collections`}>
              Manage
            </Button>
            <Button href={`/${locale}/plus`}>Upgrade</Button>
          </div>
        </div>
      </div>
    </DropdownMenu>
  );
}
