import { useEffect, useRef, useState } from "react";

import { Menu } from "../menu";

import "./index.scss";
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
  const { pathname } = useLocation();

  const menus = [
    {
      id: "html",
      label: "HTML",
      to: `/${locale}/docs/Web/HTML`,
      isActive:
        pathname.startsWith(`/${locale}/docs/Learn/HTML`) ||
        pathname.startsWith(`/${locale}/docs/Web/HTML`),
      items: [
        {
          description: "Learn to structure web content with HTML",
          hasIcon: true,
          iconClasses: "submenu-icon html",
          label: "Learn HTML",
          url: `/${locale}/docs/Learn/HTML`,
        },
        {
          description: "Look up elements, attributes, and more",
          hasIcon: true,
          iconClasses: "submenu-icon html",
          label: "HTML references",
          url: `/${locale}/docs/Web/HTML`,
        },
      ],
    },
    {
      id: "css",
      label: "CSS",
      to: `/${locale}/docs/Web/CSS`,
      isActive:
        pathname.startsWith(`/${locale}/docs/Learn/CSS`) ||
        pathname.startsWith(`/${locale}/docs/Web/CSS`),
      items: [
        {
          description: "Learn to style content using CSS",
          hasIcon: true,
          iconClasses: "submenu-icon css",
          label: "Learn CSS",
          url: `/${locale}/docs/Learn/CSS`,
        },
        {
          description: "Look up properties, selectors, and more",
          hasIcon: true,
          iconClasses: "submenu-icon css",
          label: "CSS references",
          url: `/${locale}/docs/Web/CSS`,
        },
      ],
    },
    {
      id: "js",
      label: (
        <>
          <span className="short">JS</span>
          <span className="long">JavaScript</span>
        </>
      ),
      to: `/${locale}/docs/Web/JavaScript`,
      isActive:
        pathname.startsWith(`/${locale}/docs/Learn/JavaScript`) ||
        pathname.startsWith(`/${locale}/docs/Web/JavaScript`),
      items: [
        {
          description: "Learn to run scripts in the browser",
          hasIcon: true,
          iconClasses: "submenu-icon javascript",
          label: "Learn JavaScript",
          url: `/${locale}/docs/Learn/JavaScript`,
        },
        {
          description: "Look up objects, expressions, and more",
          hasIcon: true,
          iconClasses: "submenu-icon javascript",
          label: "JavaScript references",
          url: `/${locale}/docs/Web/JavaScript`,
        },
      ],
    },
    {
      id: "apis",
      label: (
        <>
          <span className="short">APIs</span>
          <span className="long">Web APIs</span>
        </>
      ),
      to: `/${locale}/docs/Web/API`,
      isActive: pathname.startsWith(`/${locale}/docs/Web/API`),
      items: [
        {
          description: "Look up all the APIs and interfaces",
          hasIcon: true,
          iconClasses: "submenu-icon apis",
          label: "Web API references",
          url: `/${locale}/docs/Web/API`,
        },
      ],
    },
    {
      id: "http",
      label: "HTTP",
      to: `/${locale}/docs/Web/HTTP`,
      isActive: pathname.startsWith(`/${locale}/docs/Web/HTTP`),
      items: [
        {
          description: "Look up status codes, headers, and more",
          hasIcon: true,
          iconClasses: "submenu-icon http",
          label: "HTTP references",
          url: `/${locale}/docs/Web/HTTP`,
        },
      ],
    },
    {
      id: "more",
      label: "More",
      items: [
        {
          description: "Learn to make the web accessible to all",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Accessibility",
          url: `/${locale}/docs/Web/Accessibility`,
        },
        {
          description: "Develop extensions for web browsers",
          hasIcon: true,
          iconClasses: "submenu-icon",
          label: "Web Extensions",
          url: `/${locale}/docs/Mozilla/Add-ons/WebExtensions`,
        },
      ],
    },
    {
      id: "learn",
      label: "Learn",
      to: `/${locale}/docs/Learn`,
      isActive:
        pathname.startsWith("/en-US/curriculum/") ||
        pathname.startsWith(`/${locale}/docs/Learn`),
      items: [
        {
          description: "Essential skills for front-end developers",
          hasIcon: true,
          iconClasses: "submenu-icon curriculum",
          label: "MDN Curriculum",
          url: "/en-US/curriculum/",
        },
        {
          description: "Learn web development",
          hasIcon: true,
          iconClasses: "submenu-icon learn",
          label: "MDN Learning Area",
          url: `/${locale}/docs/Learn`,
        },
      ],
    },
    {
      id: "blog",
      label: "Blog",
      to: "/en-US/blog/",
      isActive: pathname.startsWith("/en-US/blog/"),
      items: [
        {
          description: "Learn about web features, and MDN",
          hasIcon: true,
          iconClasses: "submenu-icon blog",
          label: "MDN Blog",
          url: "/en-US/blog/",
        },
      ],
    },
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
        ...(PLUS_IS_ENABLED
          ? [
              {
                description: "A customized MDN experience",
                hasIcon: true,
                iconClasses: "submenu-icon plus",
                label: "MDN Plus",
                url: plusUrl,
              },
              {
                description: "Get real-time assistance and support",
                hasIcon: true,
                iconClasses: "submenu-icon plus",
                label: "AI Help",
                url: `/en-US/plus/ai-help`,
              },
              ...(!isServer && isAuthenticated
                ? [
                    {
                      description: "Your saved articles from across MDN",
                      hasIcon: true,
                      iconClasses: "submenu-icon plus",
                      label: "Collections",
                      url: `/${locale}/plus/collections`,
                    },
                  ]
                : []),
              {
                description: "All browser compatibility updates at a glance",
                hasIcon: true,
                iconClasses: "submenu-icon plus",
                label: "Updates",
                url: `/${locale}/plus/updates`,
              },
              {
                description: "Learn how to use MDN Plus",
                hasIcon: true,
                iconClasses: "submenu-icon plus",
                label: "MDN Plus Docs",
                url: `/en-US/plus/docs/features/overview`,
              },
              {
                description: "Frequently asked questions about MDN Plus",
                hasIcon: true,
                iconClasses: "submenu-icon plus",
                label: "MDN Plus FAQ",
                url: `/en-US/plus/docs/faq`,
              },
            ]
          : []),
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
