import { useState } from "react";

import { Logo } from "../../atoms/logo";
import { Button } from "../../atoms/button";
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
      <div className="wrapper">
        <Logo />
        <Button
          ariaHasPopup={"menu"}
          icon="menu-open"
          onClickHandler={toggleMainMenu}
          extraClasses="main-menu-toggle"
        >
          <span className="visually-hidden">Show Menu</span>
        </Button>

        <TopNavigationMain showMainMenu={showMainMenu} />
      </div>
    </header>
  );
}
