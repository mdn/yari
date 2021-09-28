import { useRef, useState } from "react";

import HeaderAuthContainer from "../../molecules/header-auth-container";
import { Logo } from "../../atoms/logo";
import MainMenu from "../../molecules/main-menu";
import ToggleSeachButton from "../../atoms/toggle-search-button";
import { Search } from "../../molecules/search";

import "./index.scss";

export function Header() {
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const mainMenuToggleRef = useRef<null | HTMLButtonElement>(null);

  function toggleMainMenu() {
    const pageOverlay = document.querySelector(".page-overlay");
    const mainMenuButton = mainMenuToggleRef.current;

    if (mainMenuButton) {
      mainMenuButton.classList.toggle("expanded");
      setShowMainMenu(!showMainMenu);
    }

    if (pageOverlay) {
      pageOverlay.classList.toggle("hidden");
    }
  }

  return (
    <header className="page-header">
      <Logo />
      <button
        ref={mainMenuToggleRef}
        type="button"
        className="ghost main-menu-toggle"
        aria-haspopup="true"
        aria-label="Show Menu"
        onClick={toggleMainMenu}
      />
      <div className={`page-header-main ${showMainMenu ? "show" : ""}`}>
        <MainMenu
          toggleMainMenu={() => {
            toggleMainMenu();
          }}
        />
        {showSearch ? (
          <Search />
        ) : (
          <>
            <div className="header-search">
              <ToggleSeachButton
                onClick={() => {
                  setShowSearch(true);
                }}
              />
            </div>
            <HeaderAuthContainer />
          </>
        )}
      </div>
    </header>
  );
}
