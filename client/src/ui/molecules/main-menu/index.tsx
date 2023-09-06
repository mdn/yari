import { useEffect, useRef, useState } from "react";

import { GuidesMenu } from "../guides-menu";
import { ReferenceMenu } from "../reference-menu";
import { PlusMenu } from "../plus-menu";

import "./index.scss";
import { PLUS_IS_ENABLED } from "../../../env";
import { useLocale } from "../../../hooks";

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
        <li className="top-level-entry-container">
          <a className="top-level-entry menu-link" href="/en-US/blog/">
            Blog
          </a>
        </li>
        <li className="top-level-entry-container">
          <a className="top-level-entry menu-link" href={`/${locale}/play`}>
            Play <sup className="new">New</sup>
          </a>
        </li>
        <li className="top-level-entry-container">
          <a className="top-level-entry menu-link" href="/en-US/plus/ai-help/">
            AI Help <sup className="new beta">Beta</sup>
          </a>
        </li>
      </ul>
    </nav>
  );
}
