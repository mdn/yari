import { useState } from "react";

import Container from "../../atoms/container";
import { Logo } from "../../atoms/logo";
import { Button } from "../../atoms/button";
import { TopNavigationMain } from "../top-navigation-main";

import "./index.scss";
import { useLocation } from "react-router-dom";

const DARK_NAV_ROUTES = [/\/plus\/?$/i, "_homepage", /^\/?$/];
const TRANSPARENT_NAV_ROUTES = []; //["_homepage", /\/?$/];

export function TopNavigation() {
  const location = useLocation();
  const [showMainMenu, setShowMainMenu] = useState(false);

  function toggleMainMenu() {
    setShowMainMenu(!showMainMenu);
  }

  /*
    In this situation the assistive text, button text, and title text are
    similar enough that they could be the same.
  */
  const assistiveText = showMainMenu ? "Close main menu" : "Open main menu";
  const route = location.pathname.substring(location.pathname.indexOf("/", 1));
  const dark = DARK_NAV_ROUTES.some((r) => route.match(r));
  const transparent = TRANSPARENT_NAV_ROUTES.some((r) => route.match(r));

  return (
    <header
      className={`top-navigation ${showMainMenu ? "show-nav" : ""}
      ${dark ? " dark" : ""}
      ${transparent ? " is-transparent" : ""}`}
    >
      <Container>
        <div className="top-navigation-wrap">
          <Logo />
          <Button
            type="action"
            aria-haspopup={"menu"}
            aria-label={assistiveText}
            aria-expanded={showMainMenu}
            title={assistiveText}
            icon={showMainMenu ? "cancel" : "menu"}
            onClickHandler={toggleMainMenu}
            extraClasses="main-menu-toggle"
          >
            <span className="visually-hidden">{assistiveText}</span>
          </Button>
        </div>

        <TopNavigationMain isOpenOnMobile={showMainMenu} />
      </Container>
    </header>
  );
}
