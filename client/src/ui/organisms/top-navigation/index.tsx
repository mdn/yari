import { useState } from "react";

import { Logo } from "../../atoms/logo";
import { IconButton } from "../../atoms/icon-button";
import { TopNavigationMain } from "../top-navigation-main";

import "./index.scss";

export function TopNavigation() {
  const [showMainMenu, setShowMainMenu] = useState(false);

  function toggleMainMenu(event) {
    const pageOverlay = document.querySelector(".page-overlay");
    const mainMenuButton = event.target;

    if (mainMenuButton) {
      mainMenuButton.classList.toggle("menu-close");
      setShowMainMenu(!showMainMenu);
    }

    if (pageOverlay) {
      pageOverlay.classList.toggle("hidden");
    }
  }

  return (
    <header className="top-navigation">
      <Logo />
      <IconButton
        ariaHasPopup={"menu"}
        clickHandler={toggleMainMenu}
        extraClasses="main-menu-toggle"
        iconClassName="menu-open"
      >
        <span className="visually-hidden">Show Menu</span>
      </IconButton>

      <TopNavigationMain showMainMenu={showMainMenu} />
    </header>
  );
}
