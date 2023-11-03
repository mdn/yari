import { useEffect, useRef, useState } from "react";

import { GuidesMenu } from "../guides-menu";
import { ReferenceMenu } from "../reference-menu";
import { PlusMenu } from "../plus-menu";

import "./index.scss";
import { PLUS_IS_ENABLED } from "../../../env";
import { useLocale } from "../../../hooks";
import { useGleanClick } from "../../../telemetry/glean-context";
import { MENU } from "../../../telemetry/constants";
import { useLocation } from "react-router";

export default function MainMenu({ isOpenOnMobile }) {
  const locale = useLocale();
  const previousActiveElement = useRef<null | HTMLButtonElement>(null);
  const mainMenuRef = useRef<null | HTMLUListElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = useState<string | null>(null);

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  useEffect(() => {
    const mainMenu = mainMenuRef.current;

    // by default the main menu contains a `nojs` class which
    // then allows users on desktop to interact with the main
    // menu via hover events if the JavsScript failed for whatever
    // reason. If all is well though, we remove the class here and
    // let JavaScript take over the interaction
    if (mainMenu) {
      mainMenu.classList.remove("nojs");
    }

    const focusableSubmenuItemSelector = 'ul.show a[tabindex="0"]';
    mainMenu
      ?.querySelector<HTMLAnchorElement>(focusableSubmenuItemSelector)
      ?.focus();

    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        hideSubMenuIfVisible();

        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }
    });
  });

  useEffect(() => {
    if (!isOpenOnMobile && visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }, [isOpenOnMobile, visibleSubMenuId]);

  function toggleMenu(id) {
    if (visibleSubMenuId === id) {
      setVisibleSubMenuId(null);
    } else {
      setVisibleSubMenuId(id);
    }
  }

  return (
    <nav className="main-nav" aria-label="Main menu">
      <ul className="main-menu nojs" ref={mainMenuRef}>
        <ReferenceMenu
          visibleSubMenuId={visibleSubMenuId}
          toggleMenu={toggleMenu}
        />
        <GuidesMenu
          visibleSubMenuId={visibleSubMenuId}
          toggleMenu={toggleMenu}
        />
        {PLUS_IS_ENABLED && (
          <PlusMenu
            visibleSubMenuId={visibleSubMenuId}
            toggleMenu={toggleMenu}
          />
        )}
        <TopLevelMenuLink to="/en-US/blog/">Blog</TopLevelMenuLink>
        <TopLevelMenuLink to={`/${locale}/play`}>Play</TopLevelMenuLink>
        <TopLevelMenuLink to="/en-US/plus/ai-help/">
          AI Help <sup className="new beta">Beta</sup>
        </TopLevelMenuLink>
      </ul>
    </nav>
  );
}

function TopLevelMenuLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const gleanClick = useGleanClick();

  const isActive = pathname.startsWith(to.split("#", 2)[0]);

  return (
    <li className={`top-level-entry-container ${isActive ? "active" : ""}`}>
      <a
        className="top-level-entry menu-link"
        href={to}
        onClick={() => gleanClick(`${MENU.CLICK_LINK}: top-level -> ${to}`)}
      >
        {children}
      </a>
    </li>
  );
}
