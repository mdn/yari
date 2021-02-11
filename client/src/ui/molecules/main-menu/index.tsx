import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { useGA } from "../../../ga-context";
import { useLocale } from "../../../hooks";

import "./index.scss";

export default function MainMenu({
  toggleMainMenu,
}: {
  toggleMainMenu?: () => void;
}) {
  const locale = useLocale();
  const previousActiveElement = useRef<null | HTMLButtonElement>(null);
  const mainMenuRef = useRef<null | HTMLUListElement>(null);
  const [visibleSubMenu, setVisibleSubMenu] = useState<string | null>(null);
  const [
    focusedSubmenuItemIndex,
    setFocusedSubmenuItemIndex,
  ] = useState<number>(-1);
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
  }

  /**
   * Show and hide submenus in the main menu, send GA events and updates
   * the ARIA state.
   * @param {Object} event - onClick event triggered on top-level menu item
   * @param {String} menuLabel - The current top-level menu item label
   */
  function toggleSubMenu(event, menuLabel, menuLabelId) {
    const expandedState = visibleSubMenu === menuLabel ? false : true;

    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;

    setVisibleSubMenu(visibleSubMenu === menuLabel ? null : menuLabel);
    sendMenuItemInteraction(event);

    if (expandedState) {
      setFocusedSubmenuItemIndex(0);
    }
  }

  function onMenuButtonFocus(event: React.FocusEvent<HTMLButtonElement>) {
    setFocusedSubmenuItemIndex(-1);
    sendMenuItemInteraction(event);
  }

  function onSubmenuKeydown(
    event: React.KeyboardEvent,
    menuLabel: string,
    submenuLength: number
  ) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (focusedSubmenuItemIndex === -1) {
        previousActiveElement.current = event.target as HTMLButtonElement;
        setVisibleSubMenu(menuLabel);
      }

      switch (event.key) {
        case "ArrowDown":
          setFocusedSubmenuItemIndex(
            (focusedSubmenuItemIndex + 1) % submenuLength
          );
          break;
        case "ArrowUp":
          if (focusedSubmenuItemIndex <= 0) {
            setFocusedSubmenuItemIndex(submenuLength - 1);
          } else {
            setFocusedSubmenuItemIndex(focusedSubmenuItemIndex - 1);
          }
      }
    }
  }

  useEffect(() => {
    const mainMenu = mainMenuRef.current;

    mainMenu
      ?.querySelector<HTMLAnchorElement>('ul.show a[tabindex="0"]')
      ?.focus();

    // by default the main menu contains a `nojs` class which
    // then allows users on desktop to interact with the main
    // menu via hover events if the JavsScript failed for whatever
    // reason. If all is well though, we remove the class here and
    // let JavaScript take over the interaction
    if (mainMenu) {
      mainMenu.classList.remove("nojs");
    }

    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        hideSubMenuIfVisible();

        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }
    });
  });

  const menus = [
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
          url: `/${locale}/docs/MDN/Contribute/Feedback`,
          label: "Send Feedback",
        },
        {
          url: `/${locale}/docs/MDN/Contribute`,
          label: "Contribute to MDN",
        },
        {
          label: "Report a content issue",
          external: true,
          url: "https://github.com/mdn/content/issues/new",
          onClick: (event) => {
            const onGithubElement = document.querySelector("#on-github");
            if (onGithubElement) {
              event.preventDefault();
              if (toggleMainMenu) {
                toggleMainMenu();
              }
              onGithubElement.scrollIntoView({ behavior: "smooth" });
            }
          },
        },
        {
          label: "Report a platform issue",
          external: true,
          url: "https://github.com/mdn/yari/issues/new",
        },
      ],
    },
  ];

  return (
    <nav className="main-nav" aria-label="Main menu">
      <ul className="main-menu nojs" ref={mainMenuRef}>
        {menus.map((menuEntry) => (
          <li
            key={menuEntry.label}
            className="top-level-entry-container"
            onKeyDown={(event) => {
              onSubmenuKeydown(event, menuEntry.label, menuEntry.items.length);
            }}
          >
            <button
              id={`${menuEntry.labelId}-button`}
              type="button"
              className="top-level-entry"
              aria-haspopup="menu"
              aria-expanded={menuEntry.label === visibleSubMenu}
              onFocus={onMenuButtonFocus}
              onClick={(event) => {
                toggleSubMenu(event, menuEntry.label, menuEntry.labelId);
              }}
            >
              {menuEntry.label}
            </button>
            <ul
              className={`${menuEntry.labelId} ${
                menuEntry.label === visibleSubMenu ? "show" : ""
              }`}
              role="menu"
              aria-labelledby={`${menuEntry.labelId}-button`}
            >
              {menuEntry.items.map((item, index) => (
                <li key={item.url} role="none">
                  {item.external ? (
                    <a
                      tabIndex={index === focusedSubmenuItemIndex ? 0 : -1}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={item.url}
                      onClick={(event) => {
                        item.onClick
                          ? item.onClick(event)
                          : sendMenuItemInteraction(event);
                      }}
                      onContextMenu={sendMenuItemInteraction}
                      role="menuitem"
                    >
                      {item.label} &#x1f310;
                    </a>
                  ) : (
                    <a
                      tabIndex={index === focusedSubmenuItemIndex ? 0 : -1}
                      href={item.url}
                      onClick={(event) => {
                        item.onClick
                          ? item.onClick(event)
                          : sendMenuItemInteraction(event);
                      }}
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
