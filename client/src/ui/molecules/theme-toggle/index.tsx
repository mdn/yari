import React from "react";
import { switchTheme } from "../../../utils";
import { Icon } from "../../atoms/icon";
import { Switch } from "../../atoms/switch";

import "./index.scss";

export function ThemeToggle() {
  const isServer = typeof window === "undefined";
  const [activeTheme, setActiveTheme] = React.useState(
    (!isServer && document?.body?.className) || "light"
  );
  const [dark, setDark] = React.useState(activeTheme === "dark");

  const toggle = (e) => {
    let checked = e?.target?.checked || false;
    const theme = checked ? "dark" : "light";
    switchTheme(theme, setActiveTheme);
    setDark(checked);
  };

  return (
    <div className="theme-toggle">
      <Icon name="theme"></Icon>
      <Switch
        name="themeToggle"
        hiddenLabel={`toggle theme to ${dark ? "light" : "dark"} mode`}
        checked={dark}
        toggle={toggle}
      ></Switch>
    </div>
  );
}
