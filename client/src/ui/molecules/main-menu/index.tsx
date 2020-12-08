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
      <ul className="main-menu">
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
              className={`${menuEntry.labelId} ${
                menuEntry.label === visibleSubMenu ? "show" : ""
              }`}
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
