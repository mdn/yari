import * as React from "react";

import { useLocale } from "../../../hooks";

import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";

import "./index.scss";

export const ReferenceMenu = () => {
  const locale = useLocale();
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );
  const menu = {
    label: "References",
    id: "references",
    items: [
      {
        description: "Most basic building block of the Web",
        hasIcon: true,
        iconClasses: "submenu-icon html",
        label: "HTML",
        url: `/${locale}/docs/Web/HTML`,
      },
      {
        description: "Code used for describing document styling",
        hasIcon: true,
        iconClasses: "submenu-icon css",
        label: "CSS",
        url: `/${locale}/docs/Web/CSS`,
      },
      {
        description: "Lightweight, interpreted, object-oriented language",
        hasIcon: true,
        iconClasses: "submenu-icon javascript",
        label: "JavaScript",
        url: `/${locale}/docs/Web/JavaScript`,
      },
      {
        description: "Protocol for transmitting hypermedia documents",
        hasIcon: true,
        iconClasses: "submenu-icon http",
        label: "HTTP",
        url: `/${locale}/docs/Web/HTTP`,
      },
      {
        description: "Software interface that connects software",
        hasIcon: true,
        iconClasses: "submenu-icon apis",
        label: "APIs",
        url: `/${locale}/docs/Web/API`,
      },
      {
        description: "Discover more of what the web has to offer",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "More…",
        url: `/${locale}/docs/Mozilla/Add-ons/WebExtensions`,
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
      <Button
        id={`${menu.id}-button`}
        extraClasses="top-level-entry with-icon-flex space-between mobile-only"
        ariaHasPopup="menu"
        ariaExpanded={menu.id === visibleSubMenuId}
        onClickHandler={(event) => {
          toggleSubMenu(event, menu.id);
        }}
      >
        {menu.label}
      </Button>

      <Submenu
        menuEntry={menu}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </li>
  );
};
