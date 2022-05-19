// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
import { useLocale } from "../../../hooks";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/button'. Did you m... Remove this comment to see the full error message
import { Button } from "../../atoms/button";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/icon'. Did you mea... Remove this comment to see the full error message
import { Icon } from "../../atoms/icon";
import "./index.scss";

export function ManageOrUpgradeDialogNotifications({ setShow }) {
  const locale = useLocale();

  return (
    <div
      className={`watch-submenu manage-upgrade-dialog show`}
      role="menu"
      aria-labelledby={`manage-upgrade-dialog-button`}
    >
      <button
        onClick={() => setShow(false)}
        className="watch-submenu-header mobile-only"
      >
        <span className="watch-submenu-header-wrap">
          <Icon name="chevron" />
          Back
        </span>
      </button>
      <p>You've reached the limit of articles you can watch!</p>
      <p>
        Manage your notifications settings or upgrade to MDN Plus to unlock
        unlimited subscriptions
      </p>
      <div className="watch-submenu-item is-button-row">
        <Button
          type="secondary"
          href={`/${locale}/plus/notifications/watching`}
        >
          Manage
        </Button>
        <Button href={`/${locale}/plus`}>Upgrade</Button>
      </div>
    </div>
  );
}

export function ManageOrUpgradeDialogCollections({ setShow }) {
  const locale = useLocale();

  return (
    <div
      className={`manage-upgrade-dialog show`}
      role="menu"
      aria-labelledby={`manage-upgrade-dialog-button`}
    >
      <button
        onClick={() => setShow(false)}
        className="watch-submenu-header mobile-only"
      >
        <span className="watch-submenu-header-wrap">
          <Icon name="chevron" />
          Back
        </span>
      </button>
      <p>You've reached the limit of articles you can save!</p>
      <p>
        Manage your collection or upgrade to MDN Plus to unlock unlimited saves
      </p>
      <div className="watch-submenu-item is-button-row">
        <Button type="secondary" href={`/${locale}/plus/collections`}>
          Manage
        </Button>
        <Button href={`/${locale}/plus`}>Upgrade</Button>
      </div>
    </div>
  );
}
