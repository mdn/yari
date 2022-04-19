import * as React from "react";
import { useState } from "react";

import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

import "./index.scss";
import { postToIEx, switchTheme } from "../../../utils";

type ThemeButton = {
  id: string;
  label: string;
};

export const ThemeSwitcher = () => {
  const menuId = "themes-menu";
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = React.useState("os-default");

  function ThemeButton({ id, label }: ThemeButton) {
    return (
      <Button
        extraClasses={`
          ${activeTheme === id ? "active-menu-item" : ""}
        `}
        icon={`theme-${id}`}
        onClickHandler={() => {
          switchTheme(id, setActiveTheme);
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

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme) {
      switchTheme(theme, setActiveTheme);
      postToIEx(theme);
    }
  }, [activeTheme]);

  return (
    <DropdownMenuWrapper
      className="theme-switcher-menu"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Button
        type="action"
        ariaHasPopup={"menu"}
        ariaExpanded={isOpen || undefined}
        icon={`theme-${activeTheme}`}
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
