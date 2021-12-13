import * as React from "react";

import { Button } from "../../atoms/button";
import { IEX_DOMAIN } from "../../../constants";

import "./index.scss";

export const ThemeSwitcher = () => {
  const menuId = "themes-menu";
  const [activeTheme, setActiveTheme] = React.useState("light");
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  /**
   * Posts the name of the theme we are changing to to the
   * interactive examples `iframe`.
   * @param { string } theme - The theme to switch to
   */
  function postToIEx(theme: string) {
    const iexFrame = document.querySelector(
      ".interactive"
    ) as HTMLIFrameElement;

    if (iexFrame) {
      iexFrame.contentWindow?.postMessage({ theme: theme }, IEX_DOMAIN);
    }
  }

  function switchTheme(theme: string) {
    const body = document.querySelector("body");

    if (window && body) {
      body.className = theme;
      window.localStorage.setItem("theme", theme);
      setActiveTheme(theme);
      postToIEx(theme);
    }
  }

  /**
   * Show and hide submenu
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme) {
      switchTheme(theme);
      postToIEx(theme);
    }

    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        hideSubMenuIfVisible();
      }
    });
  });

  return (
    <div className="theme-switcher-menu">
      <Button
        type="action"
        ariaControls={menuId}
        ariaHasPopup={"menu"}
        ariaExpanded={menuId === visibleSubMenuId}
        icon="theme"
        extraClasses="theme-switcher-menu"
        onClickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        Theme
      </Button>

      <ul
        className={`${
          visibleSubMenuId
            ? "submenu themes-menu  show"
            : "sub-menu themes-menu"
        }`}
        id={menuId}
      >
        <li>
          <button
            type="button"
            className={`submenu-item ${
              activeTheme === "light" ? "active-menu-item" : undefined
            }`}
            onClick={() => {
              switchTheme("light");
              setVisibleSubMenuId(null);
            }}
          >
            Light
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`submenu-item ${
              activeTheme === "dark" ? "active-menu-item" : undefined
            }`}
            onClick={() => {
              switchTheme("dark");
              setVisibleSubMenuId(null);
            }}
          >
            Dark
          </button>
        </li>
      </ul>
    </div>
  );
};
