import { IconButton } from "../../atoms/icon-button";

import "./index.scss";

export const ThemeSwitcher = () => {
  return (
    <IconButton extraClasses="theme-switcher-menu">
      <span className="">Theme</span>
    </IconButton>
  );
};
