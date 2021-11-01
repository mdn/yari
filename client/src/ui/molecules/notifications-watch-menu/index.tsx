import React from "react";

import { IconButton } from "../../atoms/icon-button";

import "./index.scss";

export const NotificationsWatchMenu = () => {
  const menuId = "watch-submenu";
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

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

      <form
        className={`${menuId} ${menuId === visibleSubMenuId ? "show" : ""}`}
        role="menu"
        aria-labelledby={`${menuId}-button`}
      >
        <div className="watch-submenu-header">Notifications</div>

        <button
          type="submit"
          role="menuitemradio"
          aria-checked="false"
          className="watch-menu-button"
        >
          <span className="watch-menu-button-wrap">
            <span className="watch-menu-button-status">✅</span>

            <span className="watch-menu-button-label">Major updates</span>
            <span className="watch-menu-button-text">
              Only receive notifications of major browser compatability releases
              and revisions to this article.
            </span>
          </span>
        </button>

        <button
          type="submit"
          role="menuitemradio"
          aria-checked="true"
          aria-haspopup="true"
          className="watch-menu-button"
        >
          <span className="watch-menu-button-wrap">
            <span className="watch-menu-button-status"></span>

            <span className="watch-menu-button-label">Custom</span>
            <span className="watch-menu-button-text">
              Select which events you would like to be notified of.
            </span>
          </span>
        </button>

        <button
          type="submit"
          role="menuitemradio"
          aria-checked="false"
          className="watch-menu-button"
        >
          <span className="watch-menu-button-wrap">
            <span className="watch-menu-button-status"></span>

            <span className="watch-menu-button-label">Unwatch</span>
            <span className="watch-menu-button-text">
              Stop receiveing notifications about this article.
            </span>
          </span>
        </button>
      </form>
    </>
  );
};
