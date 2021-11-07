import * as React from "react";

import { Button } from "../../atoms/button";
import { IconButton } from "../../atoms/icon-button";

import "./index.scss";

export const ThemeSwitcher = () => {
  const menuId = "themes-menu";
  const [activeTheme, setActiveTheme] = React.useState("light");
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  function switchTheme(theme: string) {
    const body = document.querySelector("body");

    if (window && body) {
      body.className = theme;
      window.localStorage.setItem("theme", theme);
      setActiveTheme(theme);
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
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        hideSubMenuIfVisible();
      }
    });
  });

  return (
    <div className="theme-switcher-menu">
      <IconButton
        ariaControls={menuId}
        ariaHasPopup={"menu"}
        ariaExpanded={menuId === visibleSubMenuId}
        extraClasses="theme-switcher-menu with-icon-flex mobile-only"
        clickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        <span className="">Theme</span>
      </IconButton>
      <ul
        className={`${visibleSubMenuId ? "themes-menu show" : "themes-menu"}`}
        id={menuId}
      >
        <li>
          <Button
            extraClasses={
              activeTheme === "light" ? "active-menu-item" : undefined
            }
            onClickHandler={() => {
              switchTheme("light");
              setVisibleSubMenuId(null);
            }}
          >
            Light
          </Button>
        </li>
        <li>
          <Button
            extraClasses={
              activeTheme === "dark" ? "active-menu-item" : undefined
            }
            onClickHandler={() => {
              switchTheme("dark");
              setVisibleSubMenuId(null);
            }}
          >
            Dark
          </Button>
        </li>
        <li>
          <Button
            extraClasses={
              activeTheme === "high-contrast-white"
                ? "active-menu-item"
                : undefined
            }
            onClickHandler={() => {
              switchTheme("high-contrast-white");
              setVisibleSubMenuId(null);
            }}
          >
            High contrast(light)
          </Button>
        </li>
        <li>
          <Button
            extraClasses={
              activeTheme === "high-contrast-black"
                ? "active-menu-item"
                : undefined
            }
            onClickHandler={() => {
              switchTheme("high-contrast-black");
              setVisibleSubMenuId(null);
            }}
          >
            High contrast(dark)
          </Button>
        </li>
      </ul>
    </div>
  );
};
