import * as React from "react";
import { Link } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { Submenu } from "../submenu";

import "./index.scss";

export const GuidesMenu = () => {
  const locale = useLocale();
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  const menu = {
    label: "Guides",
    id: "guides",
    items: [
      {
        label: "Learn web development",
        url: `/${locale}/docs/Learn`,
      },
      {
        label: "HTML",
        url: `/${locale}/docs/Learn/HTML`,
      },
      {
        label: "CSS",
        url: `/${locale}/docs/Learn/CSS`,
      },
      {
        label: "JavaScript",
        url: `/${locale}/docs/Learn/JavaScript`,
      },
      {
        label: "Web Forms",
        url: `/${locale}/docs/Learn/Forms`,
      },
      {
        label: "Accessability",
        url: `/${locale}/docs/Web/Accessibility`,
      },
    ],
  };

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

  return (
    <li key={menu.id} className="top-level-entry-container">
      <button
        type="button"
        id={`${menu.id}-button`}
        className="top-level-entry menu-toggle"
        aria-haspopup="menu"
        aria-expanded={menu.id === visibleSubMenuId}
        onClick={(event) => {
          toggleSubMenu(event, menu.id);
        }}
      >
        {menu.label}
      </button>

      <Link to={`/${locale}/docs/Web/`} className="top-level-entry">
        Guides
      </Link>

      <Submenu
        menuEntry={menu}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </li>
  );
};
