import { useState } from "react";

import { Logo } from "../../atoms/logo";
import { Button } from "../../atoms/button";
import { TopNavigationMain } from "../top-navigation-main";

import "./index.scss";

export function TopNavigation() {
  const [showMainMenu, setShowMainMenu] = useState(false);

  function toggleMainMenu() {
    const pageOverlay = document.querySelector(".page-overlay");

    setShowMainMenu(!showMainMenu);

    if (pageOverlay) {
      pageOverlay.classList.toggle("hidden");
    }
  }

  return (
    <header className="top-navigation">
      <div className="container">
        <Logo />
        <Button
          type="action"
          ariaHasPopup={"menu"}
          ariaLabel={showMainMenu ? "Close main menu" : "Open main menu"}
          icon={showMainMenu ? "cancel" : "menu"}
          onClickHandler={toggleMainMenu}
          extraClasses="main-menu-toggle"
        >
          <span className="visually-hidden">Toggle Menu</span>
        </Button>

        <TopNavigationMain showMainMenu={showMainMenu} />
      </div>
    </header>
  );
}
