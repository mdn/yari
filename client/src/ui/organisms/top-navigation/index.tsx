import { useState } from "react";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/container'. Did yo... Remove this comment to see the full error message
import Container from "../../atoms/container";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/logo'. Did you mea... Remove this comment to see the full error message
import { Logo } from "../../atoms/logo";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/button'. Did you m... Remove this comment to see the full error message
import { Button } from "../../atoms/button";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../top-navigation-main'. Did y... Remove this comment to see the full error message
import { TopNavigationMain } from "../top-navigation-main";

import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
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
      className={`main-document-header-container top-navigation ${
        showMainMenu ? "show-nav" : ""
      }
      ${dark ? " dark" : ""}
      ${transparent ? " is-transparent" : ""}`}
    >
      <Container>
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

        <TopNavigationMain isOpenOnMobile={showMainMenu} />
      </Container>
    </header>
  );
}
