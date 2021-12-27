import * as React from "react";

import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";
import { IEX_DOMAIN } from "../../../constants";

import "./index.scss";

type ThemeButton = {
  id: string;
  label: string;
};

export const ThemeSwitcher = () => {
  const menuId = "themes-menu";
  const [activeTheme, setActiveTheme] = React.useState("light");
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  function ThemeButton({ id, label }: ThemeButton) {
    return (
      <Button
        extraClasses={activeTheme === id ? "active-menu-item" : undefined}
        onClickHandler={() => {
          switchTheme(id);
          setVisibleSubMenuId(null);
        }}
      >
        {label}
      </Button>
    );
  }

  const menu = {
    label: "Themes",
    id: menuId,
    items: [
      { component: () => <ThemeButton id="light" label="Light" /> },
      { component: () => <ThemeButton id="dark" label="Dark" /> },
    ],
  };

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
        extraClasses="theme-switcher-menu small"
        onClickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        Theme
      </Button>

      <Submenu
        menuEntry={menu}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </div>
  );
};
