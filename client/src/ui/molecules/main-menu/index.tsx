import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { styled } from "linaria/react";
import { lightModeTextSecondary } from "../../vars/js/variables";

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
  const [visibleSubMenuId, setVisibleSubMenuId] = useState<string | null>(null);
  const [focusedSubmenuItemIndex, setFocusedSubmenuItemIndex] =
    useState<number>(-1);
  const [submenuCollapsedOnBlurId, setSubmenuCollapsedOnBlurId] = useState<
    string | null
  >(null);
  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  /**
   * Show and hide submenus in the main menu, send GA events and updates
   * the ARIA state.
   * @param {Object} event - onClick event triggered on top-level menu item
   * @param {String} id - The current top-level menu item id
   */
  function toggleSubMenu(event, id) {
    const expandedState = visibleSubMenuId === id ? false : true;

    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;

    setVisibleSubMenuId(visibleSubMenuId === id ? null : id);

    if (expandedState) {
      setFocusedSubmenuItemIndex(0);
    }
  }

  function onMenuButtonFocus() {
    setFocusedSubmenuItemIndex(-1);
  }

  /**
   * Handle arrow keydown events on submenu to change focused item.
   * @param {Object} event - keydown event triggered on submenu
   * @param {String} id - submenu id
   * @param {Number} itemCount - number of items in submenu
   */
  function onSubmenuKeydown(
    event: React.KeyboardEvent,
    id: string,
    itemCount: number
  ) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      // prevent page scrolling
      event.preventDefault();

      // open submenu if closed
      if (focusedSubmenuItemIndex === -1) {
        previousActiveElement.current = event.target as HTMLButtonElement;
        setVisibleSubMenuId(id);
      }

      switch (event.key) {
        case "ArrowDown":
          // focus below item and jump to top item if bottom item focused
          setFocusedSubmenuItemIndex((focusedSubmenuItemIndex + 1) % itemCount);
          break;
        case "ArrowUp":
          if (focusedSubmenuItemIndex <= 0) {
            // jump to bottom item if top item focused
            setFocusedSubmenuItemIndex(itemCount - 1);
          } else {
            setFocusedSubmenuItemIndex(focusedSubmenuItemIndex - 1);
          }
      }
    }
  }

  /**
   * Close submenu if focus leaves submenu due to tabbing or clicking outside
   */
  function onSubmenuItemBlur(submenuId: string, itemIndex: number) {
    if (itemIndex === focusedSubmenuItemIndex) {
      // prevent submenu from immediately re-opening if blur caused by clicking menu button
      setSubmenuCollapsedOnBlurId(submenuId);
      setTimeout(() => {
        setSubmenuCollapsedOnBlurId(null);
      }, 250);

      hideSubMenuIfVisible();
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

  const menus = [
    {
      label: "References",
      id: "references",
      items: [
        {
          url: `/${locale}/docs/Web/HTML`,
          label: "HTML",
          description: "Most basic building block of the Web",
        },
        {
          url: `/${locale}/docs/Web/CSS`,
          label: "CSS",
          description: "Code used for describing document styling",
        },
        {
          url: `/${locale}/docs/Web/JavaScript`,
          label: "JavaScript",
          description: "Lightweight, interpreted, object-oriented language",
        },
        {
          url: `/${locale}/docs/Web/HTTP`,
          label: "HTTP",
          description: "Protocol for transmitting hypermedia documents",
        },
        {
          url: `/${locale}/docs/Web/API`,
          label: "APIs",
          description: "Software interface that connects software",
        },
        {
          url: `/${locale}/docs/Mozilla/Add-ons/WebExtensions`,
          label: "More…",
          description: "Discover more of what the web has to offer",
        },
      ],
    },
  ];

  const TopLevelLink = styled.a`
    display: block;
    font-weight: normal;
    padding: 12px;
    padding-left: 0;

    &:link,
    &:visited {
      color: ${lightModeTextSecondary};
    }

    &:hover,
    &:focus {
      text-decoration: none;
    }
  `;

  return (
    <nav className="main-nav" aria-label="Main menu">
      <ul className="main-menu nojs" ref={mainMenuRef}>
        {menus.map((menuEntry) => (
          <li
            key={menuEntry.id}
            className="top-level-entry-container"
            onKeyDown={(event) => {
              if (menuEntry.items) {
                onSubmenuKeydown(event, menuEntry.id, menuEntry.items.length);
              }
            }}
          >
            <button
              id={`${menuEntry.id}-button`}
              type="button"
              className="top-level-entry"
              aria-haspopup="menu"
              aria-expanded={menuEntry.id === visibleSubMenuId}
              onFocus={onMenuButtonFocus}
              onClick={(event) => {
                if (submenuCollapsedOnBlurId !== menuEntry.id) {
                  // always toggle menu if not clicking button for currently open menu
                  toggleSubMenu(event, menuEntry.id);
                }
                setSubmenuCollapsedOnBlurId(null);
              }}
            >
              {menuEntry.label}
            </button>
            <ul
              className={`submenu ${menuEntry.id} ${
                menuEntry.id === visibleSubMenuId ? "show" : ""
              }`}
              role="menu"
              aria-labelledby={`${menuEntry.id}-button`}
            >
              {menuEntry.items &&
                menuEntry.items.map((item, index) => (
                  <li
                    key={item.url}
                    role="none"
                    onBlur={() => onSubmenuItemBlur(menuEntry.id, index)}
                    onMouseOver={() => setFocusedSubmenuItemIndex(index)}
                    onFocus={() => setFocusedSubmenuItemIndex(index)}
                  >
                    <a
                      tabIndex={index === focusedSubmenuItemIndex ? 0 : -1}
                      href={item.url}
                      role="menuitem"
                    >
                      <div
                        className={`tech-icon ${item.label
                          .replace("…", "")
                          .toLowerCase()}`}
                      ></div>
                      <div className="tile-technology-heading">
                        {item.label}
                      </div>
                      <p className="tile-technology-description">
                        {item.description}
                      </p>
                    </a>
                  </li>
                ))}
            </ul>
          </li>
        ))}
        <li>
          <TopLevelLink href={`/${locale}/docs/Learn`} role="menuitem">
            Guides
          </TopLevelLink>
        </li>
        <li>
          <TopLevelLink href={`/${locale}/plus`} role="menuitem">
            MDN Plus
          </TopLevelLink>
        </li>
      </ul>
    </nav>
  );
}
