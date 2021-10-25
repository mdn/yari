import * as React from "react";

import { Button } from "../../atoms/button";
import { IconButton } from "../../atoms/icon-button";
import { Submenu } from "../submenu";

import "./index.scss";

export const ThemeSwitcher = () => {
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );
  const themesMenu = {
    label: "Themes",
    id: "themes-menu",
    items: [
      {
        component: () => (
          <Button onClickHandler={() => switchTheme("light")}>Light</Button>
        ),
      },
      {
        component: () => (
          <Button onClickHandler={() => switchTheme("dark")}>Dark</Button>
        ),
      },
      {
        component: () => (
          <Button onClickHandler={() => switchTheme("light-high-contrast")}>
            High contrast(light)
          </Button>
        ),
      },
      {
        component: () => (
          <Button onClickHandler={() => switchTheme("dark-high-contrast")}>
            High contrast(dark)
          </Button>
        ),
      },
    ],
  };

  function switchTheme(theme) {
    const body = document.querySelector("body");
    if (window && body) {
      body.className = `theme-${theme}`;
      window.localStorage.setItem("theme", `theme-${theme}`);
    }
  }

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
    <>
      <IconButton
        ariaHasPopup={"menu"}
        ariaExpanded={themesMenu.id === visibleSubMenuId}
        extraClasses="theme-switcher-menu with-icon-flex mobile-only"
        clickHandler={(event) => {
          toggleSubMenu(event, themesMenu.id);
        }}
      >
        <span className="">Theme</span>
      </IconButton>
      <Submenu
        menuEntry={themesMenu}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </>
  );
};
