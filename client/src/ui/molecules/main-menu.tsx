import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGA } from "../../ga-context";
import { useLocale } from "../../hooks";

import "./main-menu.scss";

export default function MainMenu() {
  const locale = useLocale();
  const mainMenuToggleRef = useRef<null | HTMLButtonElement>(null);
  const previousActiveElement = useRef<null | HTMLButtonElement>(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [visibleSubMenu, setVisibleSubMenu] = useState<string | null>(null);
  const ga = useGA();

  /**
   * Send a signal to GA when there is an interaction on one
   * of the main menu items.
   * @param {Object} event - The event object that was triggered
   */
  function sendMenuItemInteraction(
    event:
      | React.FocusEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
  ) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const label =
      event.target instanceof HTMLAnchorElement
        ? event.target.href
        : event.target.textContent;

    ga("send", {
      hitType: "event",
      eventCategory: "Wiki",
      eventAction: "MainNav",
      eventLabel: label,
    });
  }

  function hideSubMenuIfVisible() {
    if (visibleSubMenu) {
      setVisibleSubMenu(null);
    }

    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }

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

  /**
   * Show and hide submenus in the main menu, send GA events and updates
   * the ARIA state.
   * @param {Object} event - onClick event triggered on top-level menu item
   * @param {String} menuLabel - The current top-level menu item label
   */
  function toggleSubMenu(event, menuLabel) {
    const expandedState = visibleSubMenu === menuLabel ? false : true;

    // store the current activeElement
    previousActiveElement.current = event.target;
    event.target.setAttribute("aria-expanded", expandedState);

    setVisibleSubMenu(visibleSubMenu === menuLabel ? null : menuLabel);
    sendMenuItemInteraction(event);
  }

  useEffect(() => {
    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        hideSubMenuIfVisible();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        event.target &&
        event.target instanceof HTMLElement &&
        !event.target.classList.contains("top-level-entry")
      ) {
        hideSubMenuIfVisible();
      }
    });
  });

  // The menus array includes objects that define the set of
  // menus displayed by this header component. The data structure
  // happen after the string catalog is available. And we're using
  // useMemo() so that localization only happens when the locale
  // changes.
  const menus = useMemo(
    () => [
      {
        label: "Technologies",
        labelId: "technologies",
        items: [
          {
            url: `/${locale}/docs/Web`,
            label: "Technologies Overview",
          },
          {
            url: `/${locale}/docs/Web/HTML`,
            label: "HTML",
          },
          {
            url: `/${locale}/docs/Web/CSS`,
            label: "CSS",
          },
          {
            url: `/${locale}/docs/Web/JavaScript`,
            label: "JavaScript",
          },
          {
            url: `/${locale}/docs/Web/Guide/Graphics`,
            label: "Graphics",
          },
          {
            url: `/${locale}/docs/Web/HTTP`,
            label: "HTTP",
          },
          {
            url: `/${locale}/docs/Web/API`,
            label: "APIs",
          },
          {
            url: `/${locale}/docs/Mozilla/Add-ons/WebExtensions`,
            label: "Browser Extensions",
          },
          {
            url: `/${locale}/docs/Web/MathML`,
            label: "MathML",
          },
        ],
      },
      {
        label: "References & Guides",
        labelId: "references-guides",
        items: [
          {
            url: `/${locale}/docs/Learn`,
            label: "Learn web development",
          },
          {
            url: `/${locale}/docs/Web/Tutorials`,
            label: "Tutorials",
          },
          {
            url: `/${locale}/docs/Web/Reference`,
            label: "References",
          },
          {
            url: `/${locale}/docs/Web/Guide`,
            label: "Developer Guides",
          },
          {
            url: `/${locale}/docs/Web/Accessibility`,
            label: "Accessibility",
          },
          {
            url: `/${locale}/docs/Games`,
            label: "Game development",
          },
          {
            url: `/${locale}/docs/Web`,
            label: "...more docs",
          },
        ],
      },
      {
        label: "Feedback",
        labelId: "feedback",
        items: [
          {
            url: `/${locale}/docs/MDN/Feedback`,
            label: "Send Feedback",
          },
          {
            url: "https://support.mozilla.org/",
            label: "Get Firefox help",
            external: true,
          },
          {
            url: "https://stackoverflow.com/",
            label: "Get web development help",
            external: true,
          },
          {
            url: `/${locale}/docs/MDN/Community`,
            label: "Join the MDN community",
          },
          {
            label: "Report a content problem",
            external: true,
            url: `https://github.com/mdn/sprints/issues/new?template=issue-template.md&projects=mdn/sprints/2&labels=user-report&title=${
              typeof window === "undefined" ? "" : window.location.pathname
            }`,
          },
          {
            label: "Report an issue",
            external: true,
            url: "https://github.com/mdn/kuma/issues/new/choose",
          },
        ],
      },
    ],
    [locale]
  );

  return (
    <nav className="main-nav" aria-label="Main menu">
      <button
        ref={mainMenuToggleRef}
        type="button"
        className="ghost main-menu-toggle"
        aria-haspopup="true"
        aria-label="Show Menu"
        onClick={toggleMainMenu}
      />
      <ul className={`main-menu ${showMainMenu ? "show" : ""}`}>
        {menus.map((menuEntry) => (
          <li key={menuEntry.label} className="top-level-entry-container">
            <button
              id={`${menuEntry.labelId}-button`}
              type="button"
              className="top-level-entry"
              aria-haspopup="menu"
              aria-expanded="false"
              onFocus={sendMenuItemInteraction}
              onClick={(event) => {
                toggleSubMenu(event, menuEntry.label);
              }}
            >
              {menuEntry.label}
            </button>
            <ul
              className={
                menuEntry.label === visibleSubMenu ? "show" : undefined
              }
              role="menu"
              aria-labelledby={`${menuEntry.labelId}-button`}
            >
              {menuEntry.items.map((item) => (
                <li key={item.url} role="none">
                  {item.external ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={item.url}
                      onClick={sendMenuItemInteraction}
                      onContextMenu={sendMenuItemInteraction}
                      role="menuitem"
                    >
                      {item.label} &#x1f310;
                    </a>
                  ) : (
                    <a
                      href={item.url}
                      onClick={sendMenuItemInteraction}
                      onContextMenu={sendMenuItemInteraction}
                      role="menuitem"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
