import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { useLocale } from "./hooks";

export default function MainMenu() {
  const locale = useLocale();
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [visibleSubMenu, setVisibleSubMenu] = useState<string | null>(null);

  function hideSubMenuIfVisible() {
    if (visibleSubMenu) {
      setVisibleSubMenu(null);
    }
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
        type="button"
        className={`ghost main-menu-toggle ${showMainMenu ? "expanded" : ""}`}
        aria-haspopup="true"
        aria-label="Show Menu"
        onClick={() => setShowMainMenu(!showMainMenu)}
      />
      <ul className={`main-menu ${showMainMenu ? "show" : ""}`}>
        {menus.map((menuEntry) => (
          <li key={menuEntry.label} className="top-level-entry-container">
            <button
              type="button"
              className="top-level-entry"
              aria-haspopup="true"
              onClick={() => {
                setVisibleSubMenu(
                  visibleSubMenu === menuEntry.label ? null : menuEntry.label
                );
              }}
            >
              {menuEntry.label}
            </button>
            <ul
              className={
                menuEntry.label === visibleSubMenu ? "show" : undefined
              }
              aria-expanded={
                menuEntry.label === visibleSubMenu ? "true" : "false"
              }
            >
              {menuEntry.items.map((item) => (
                <li key={item.url} role="menuitem">
                  {item.external ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={item.url}
                    >
                      {item.label} &#x1f310;
                    </a>
                  ) : (
                    <a href={item.url}>{item.label}</a>
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
