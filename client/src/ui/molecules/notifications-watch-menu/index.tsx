import React from "react";

import { IconButton } from "../../atoms/icon-button";
import { NotificationsWatchMenuCustom } from "../notifications-watch-menu-custom";
import { NotificationsWatchMenuStart } from "../notifications-watch-menu-start";

import "./index.scss";

export const NotificationsWatchMenu = () => {
  const menuId = "watch-submenu";
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );
  const [visibleStep, setVisibleStep] = React.useState<number>(0);

  /**
   * Show and hide submenus in the main menu.
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  function showStepStart() {
    setVisibleStep(0);
  }

  function showStepCustom() {
    setVisibleStep(1);
  }

  return (
    <>
      <IconButton
        extraClasses="watch-menu"
        ariaHasPopup={"menu"}
        id="watch-menu-button"
        aria-label="Watch this page for updates"
        ariaExpanded={menuId === visibleSubMenuId}
        clickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        <span className="">Watch</span>
      </IconButton>

      <div
        className={`${menuId} ${menuId === visibleSubMenuId ? "show" : ""}`}
        role="menu"
        aria-labelledby={`${menuId}-button`}
      >
        {visibleStep === 0 ? (
          <NotificationsWatchMenuStart setStepHandler={showStepCustom} />
        ) : (
          <NotificationsWatchMenuCustom setStepHandler={showStepStart} />
        )}
      </div>
    </>
  );
};
