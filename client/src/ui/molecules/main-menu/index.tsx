import { useEffect, useRef, useState } from "react";

import { Menu } from "../menu";

import "./index.scss";
import "./references.scss";
import "./guides.scss";
import "./plus.scss";
import "./tools.scss";

import { PLUS_IS_ENABLED } from "../../../env";
import { useGleanClick } from "../../../telemetry/glean-context";
import { MENU } from "../../../telemetry/constants";
import { useLocation } from "react-router";
import { useIsServer, useLocale } from "../../../hooks";
import { usePlusUrl } from "../../../plus/utils";
import { MenuEntry } from "../submenu";
import { useUserData } from "../../../user-context";
import { OBSERVATORY_TITLE } from "../../../../../libs/constants";

export default function MainMenu({ isOpenOnMobile }) {
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

  const locale = useLocale();

  // Plus menu.
  const plusUrl = usePlusUrl();
  const isServer = useIsServer();
  const userData = useUserData();
  const isAuthenticated = userData && userData.isAuthenticated;

  // Avoid that "Plus" and "AI Help" are both active.
  const { pathname } = useLocation();
  const aiHelpUrl = `/${locale}/plus/ai-help`;
  const isPlusActive =
    pathname.startsWith(plusUrl.split("#", 2)[0]) &&
    !pathname.startsWith(aiHelpUrl);

  const menus = [
    {
      id: "references",
      label: "References",
      to: `/${locale}/docs/Web`,
      items: [
        {
          description: "Web technology reference for developers",
          hasIcon: true,
          extraClasses: "apis-link-container mobile-only",
          iconClasses: "submenu-icon",
          label: "Overview / Web Technology",
          url: `/${locale}/docs/Web`,
        },
        {
          description: "Structure of content on the web",
          extraClasses: "html-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon html",
          label: "HTML",
          url: `/${locale}/docs/Web/HTML`,
        },
        {
          description: "Code used to describe document style",
          extraClasses: "css-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon css",
          label: "CSS",
          url: `/${locale}/docs/Web/CSS`,
        },
        {
          description: "General-purpose scripting language",
          extraClasses: "javascript-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon javascript",
          label: "JavaScript",
          url: `/${locale}/docs/Web/JavaScript`,
        },
        {
          description: "Protocol for transmitting web resources",
          extraClasses: "http-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon http",
          label: "HTTP",
          url: `/${locale}/docs/Web/HTTP`,
        },
        {
          description: "Interfaces for building web applications",
          extraClasses: "apis-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon apis",
          label: "Web APIs",
          url: `/${locale}/docs/Web/API`,
        },
        {
          description: "Developing extensions for web browsers",
          extraClasses: "apis-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Web Extensions",
          url: `/${locale}/docs/Mozilla/Add-ons/WebExtensions`,
        },
        {
          description: "Web technology reference for developers",
          extraClasses: "apis-link-container desktop-only",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Web Technology",
          url: `/${locale}/docs/Web`,
        },
      ],
    },
    {
      id: "guides",
      label: "Guides",
      to: `/${locale}/docs/Learn`,
      items: [
        {
          description: "Learn web development",
          hasIcon: true,
          extraClasses: "apis-link-container mobile-only",
          iconClasses: "submenu-icon learn",
          label: "Overview / MDN Learning Area",
          url: `/${locale}/docs/Learn`,
        },
        {
          description: "Learn web development",
          extraClasses: "apis-link-container desktop-only",
          hasIcon: true,
          iconClasses: "submenu-icon learn",
          label: "MDN Learning Area",
          url: `/${locale}/docs/Learn`,
        },
        {
          description: "Learn to structure web content with HTML",
          extraClasses: "html-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon html",
          label: "HTML",
          url: `/${locale}/docs/Learn/HTML`,
        },
        {
          description: "Learn to style content using CSS",
          extraClasses: "css-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon css",
          label: "CSS",
          url: `/${locale}/docs/Learn/CSS`,
        },
        {
          description: "Learn to run scripts in the browser",
          extraClasses: "javascript-link-container",
          hasIcon: true,
          iconClasses: "submenu-icon javascript",
          label: "JavaScript",
          url: `/${locale}/docs/Learn/JavaScript`,
        },
        {
          description: "Learn to make the web accessible to all",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Accessibility",
          url: `/${locale}/docs/Web/Accessibility`,
        },
      ],
    },
    PLUS_IS_ENABLED && {
      label: "Plus",
      id: "mdn-plus",
      isActive: isPlusActive,
      to: plusUrl,
      items: [
        {
          description: "A customized MDN experience",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Overview",
          url: plusUrl,
        },
        {
          description: "Get real-time assistance and support",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "AI Help",
          url: aiHelpUrl,
        },
        ...(!isServer && isAuthenticated
          ? [
              {
                description: "Your saved articles from across MDN",
                hasIcon: true,
                iconClasses: "submenu-icon",
                label: "Collections",
                url: `/${locale}/plus/collections`,
              },
            ]
          : []),
        {
          description: "All browser compatibility updates at a glance",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Updates",
          url: `/${locale}/plus/updates`,
        },
        {
          description: "Learn how to use MDN Plus",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Documentation",
          url: `/en-US/plus/docs/features/overview`,
        },
        {
          description: "Frequently asked questions about MDN Plus",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "FAQ",
          url: `/en-US/plus/docs/faq`,
        },
      ],
    },
    <TopLevelMenuLink to="/en-US/curriculum/">Curriculum</TopLevelMenuLink>,
    <TopLevelMenuLink to="/en-US/blog/">Blog</TopLevelMenuLink>,
    {
      id: "tools",
      label: "Tools",
      items: [
        {
          description: "Write, test and share your code",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Playground",
          url: `/${locale}/play`,
        },
        {
          description: "Scan a website for free",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: OBSERVATORY_TITLE,
          url: `/en-US/observatory`,
        },
        {
          description: "Get real-time assistance and support",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "AI Help",
          url: `/en-US/plus/ai-help`,
        },
      ],
    },
  ].filter(Boolean) as (MenuEntry | React.ReactElement)[];

  return (
    <nav className="main-nav" aria-label="Main menu">
      <ul className="main-menu nojs" ref={mainMenuRef}>
        {menus.map((menu) =>
          isMenuEntry(menu) ? (
            <Menu
              menu={menu}
              isActive={menu.isActive}
              isOpen={visibleSubMenuId === menu.id}
              toggle={toggleMenu}
            />
          ) : (
            menu
          )
        )}
      </ul>
    </nav>
  );
}

function isMenuEntry(menu: any): menu is MenuEntry {
  return typeof menu.id === "string";
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
