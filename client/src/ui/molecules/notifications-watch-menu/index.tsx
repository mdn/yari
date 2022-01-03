import React from "react";

import { Button } from "../../atoms/button";
import { NotificationsWatchMenuCustom } from "../notifications-watch-menu-custom";
import { NotificationsWatchMenuStart } from "../notifications-watch-menu-start";

import "./index.scss";

export const NotificationsWatchMenu = ({ doc }) => {
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

  return (
    <>
      <Button
        type="action"
        id="watch-menu-button"
        icon="eye"
        extraClasses="small watch-menu"
        ariaHasPopup={"menu"}
        aria-label="Watch this page for updates"
        ariaExpanded={menuId === visibleSubMenuId}
        onClickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        Watch
      </Button>

      <div
        className={`${menuId} ${menuId === visibleSubMenuId ? "show" : ""}`}
        role="menu"
        aria-labelledby={`${menuId}-button`}
      >
        {visibleStep === 0 ? (
          <NotificationsWatchMenuStart
            doc={doc}
            setStepHandler={setVisibleStep}
          />
        ) : (
          <NotificationsWatchMenuCustom
            doc={doc}
            setStepHandler={setVisibleStep}
          />
        )}
      </div>
    </>
  );
};
