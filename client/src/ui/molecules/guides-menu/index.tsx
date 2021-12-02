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
  /*
  <ul class="references-guides " role="menu" aria-labelledby="references-guides-button"><li role="none"><a tabindex="-1" href="/en-US/docs/Learn" role="menuitem">Learn web development</a></li><li role="none"><a tabindex="-1" href="/en-US/docs/Web/Tutorials" role="menuitem">Tutorials</a></li><li role="none"><a tabindex="-1" href="/en-US/docs/Web/Reference" role="menuitem">References</a></li><li role="none"><a tabindex="0" href="/en-US/docs/Web/Guide" role="menuitem">Developer Guides</a></li><li role="none"><a tabindex="-1" href="/en-US/docs/Web/Accessibility" role="menuitem">Accessibility</a></li><li role="none"><a tabindex="-1" href="/en-US/docs/Games" role="menuitem">Game development</a></li><li role="none"><a tabindex="-1" href="/en-US/docs/Web" role="menuitem">...more docs</a></li></ul>
*/
  const menu = {
    label: "Guides",
    id: "guides",
    items: [
      {
        label: "Learn web development",
        url: `/${locale}/docs/Learn`,
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
