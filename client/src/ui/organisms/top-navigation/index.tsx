import { useState } from "react";

import { Logo } from "../../atoms/logo";
import { Button } from "../../atoms/button";
import { TopNavigationMain } from "../top-navigation-main";

import "./index.scss";

export function TopNavigation() {
  const [showMainMenu, setShowMainMenu] = useState(false);

  function toggleMainMenu() {
    setShowMainMenu(!showMainMenu);
  }

  /*
    In this situation the assistive text, button text, and title text are
    similar enough that they could be the same.
  */
  const assistiveText = showMainMenu ? "Close main menu" : "Open main menu";

  return (
    <header className={`top-navigation${showMainMenu ? " show-nav" : ""}`}>
      <div className="container">
        <div className="top-navigation-wrap">
          <Logo />
          <Button
            type="action"
            ariaHasPopup={"menu"}
            ariaLabel={assistiveText}
            ariaExpanded={showMainMenu}
            title={assistiveText}
            icon={showMainMenu ? "cancel" : "menu"}
            onClickHandler={toggleMainMenu}
            extraClasses="main-menu-toggle"
          >
            <span className="visually-hidden">{assistiveText}</span>
          </Button>
        </div>

        <TopNavigationMain />
      </div>
    </header>
  );
}
