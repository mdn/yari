import * as React from "react";

import { useUserData } from "../../../user-context";
import { useLocale } from "../../../hooks";

import { Link } from "react-router-dom";
import { Submenu } from "../submenu";

import "./index.scss";

export const PlusMenu = () => {
  const locale = useLocale();
  const userData = useUserData();
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );
  const plusMenu = {
    label: "MDN Plus",
    id: "mdn-plus",
    items: [
      {
        description: "Collect articles from across MDN",
        hasIcon: true,
        iconClasses: "submenu-icon bookmarks-icon",
        label: "My Collection",
        url: `/${locale}/plus/bookmarks`,
      },
      {
        description: "Stay up to date with MDN content",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "My Notifications",
        url: `/${locale}/plus/notifications`,
      },
      {
        description: "Learn more about your MDN Plus Subscription",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "About MDN Plus",
        url: `/${locale}/plus/`,
      },
    ],
  };
  const isSubscriber = userData && userData.isSubscriber;

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  /**
   * Show and hide submenus in the main menu, send GA events and updates
   * the ARIA state.
   * @param {Object} event - The event that triggered the function.
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(event, menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  return isSubscriber ? (
    <li key={plusMenu.id} className="top-level-entry-container">
      <button
        id={`${plusMenu.id}-button`}
        className="top-level-entry menu-toggle"
        aria-haspopup="menu"
        aria-expanded={plusMenu.id === visibleSubMenuId}
        onClick={(event) => {
          toggleSubMenu(event, plusMenu.id);
        }}
      >
        {plusMenu.label}
      </button>

      <Link to={`/${locale}/plus/`} className="top-level-entry">
        {plusMenu.label}
      </Link>

      <Submenu
        menuEntry={plusMenu}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </li>
  ) : (
    <li>
      <a href={`/${locale}/plus`} className="top-level-entry">
        MDN Plus
      </a>
    </li>
  );
};
