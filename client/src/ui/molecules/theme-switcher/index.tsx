import * as React from "react";
import { useState } from "react";

import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";
import { IEX_DOMAIN } from "../../../constants";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

import "./index.scss";

type ThemeButton = {
  id: string;
  label: string;
};

export const ThemeSwitcher = () => {
  const menuId = "themes-menu";
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = React.useState("light");

  function ThemeButton({ id, label }: ThemeButton) {
    return (
      <Button
        extraClasses={`
          ${activeTheme === id ? "active-menu-item" : undefined}
          ${`is-` + id}
        `}
        onClickHandler={() => {
          switchTheme(id);
          setIsOpen(false);
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
      { component: () => <ThemeButton id="os-default" label="OS Default" /> },
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
      body.style.backgroundColor = "";
      window.localStorage.setItem("theme", theme);
      setActiveTheme(theme);
      postToIEx(theme);
    }
  }

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme) {
      switchTheme(theme);
      postToIEx(theme);
    }
  });

  return (
    <DropdownMenuWrapper
      className="theme-switcher-menu"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Button
        type="action"
        ariaControls={menuId}
        ariaHasPopup={"menu"}
        ariaExpanded={isOpen || undefined}
        icon="theme"
        extraClasses="theme-switcher-menu small"
        onClickHandler={() => {
          setIsOpen(!isOpen);
        }}
      >
        Theme
      </Button>

      <DropdownMenu>
        <Submenu menuEntry={menu} />
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
};
