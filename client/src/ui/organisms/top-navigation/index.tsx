import Container from "../../atoms/container";
import { Logo } from "../../atoms/logo";
import { TopNavigationMain } from "../top-navigation-main";

import "./index.scss";
import { useLocation } from "react-router-dom";

const DARK_NAV_ROUTES = [/\/plus\/?$/i, "_homepage", /^\/?$/];
const TRANSPARENT_NAV_ROUTES = []; //["_homepage", /\/?$/];

export function TopNavigation() {
  const location = useLocation();

  const assistiveText = "Toggle main menu";
  const route = location.pathname.substring(location.pathname.indexOf("/", 1));
  const dark = DARK_NAV_ROUTES.some((r) => route.match(r));
  const transparent = TRANSPARENT_NAV_ROUTES.some((r) => route.match(r));

  return (
    <>
      <input
        id="menu-toggle"
        type="checkbox"
        aria-label={assistiveText}
        title={assistiveText}
        className="visually-hidden"
      ></input>
      <header
        className={`top-navigation
      ${dark ? " dark" : ""}
      ${transparent ? " is-transparent" : ""}`}
      >
        <Container extraClasses="top-navigation-main">
          <Logo />
          <label htmlFor="menu-toggle" className="main-menu-toggle">
            <div className="menu-toggle-icon"></div>
            <span className="visually-hidden">{assistiveText}</span>
          </label>

          <TopNavigationMain />
        </Container>
      </header>
    </>
  );
}
