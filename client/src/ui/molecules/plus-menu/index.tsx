import "./index.scss";
import { usePlusUrl } from "../../../plus/utils";
import { Menu } from "../menu";
import { useIsServer, useLocale, useViewedState } from "../../../hooks";
import { useUserData } from "../../../user-context";
import { MenuEntry } from "../submenu";
import { FeatureId } from "../../../constants";
import { useLocation } from "react-router";

export const PlusMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const plusUrl = usePlusUrl();
  const locale = useLocale();
  const isServer = useIsServer();
  const userData = useUserData();
  const isAuthenticated = userData && userData.isAuthenticated;

  const { isViewed } = useViewedState();

  const { pathname } = useLocation();
  const aiHelpUrl = `/${locale}/plus/ai-help`;
  const isActive =
    pathname.startsWith(plusUrl.split("#", 2)[0]) &&
    !pathname.startsWith(aiHelpUrl);

  const plusMenu: MenuEntry = {
    label: "Plus",
    id: "mdn-plus",
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
        label: "AI Help (beta)",
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
        dot:
          Date.now() < 1675209600000 && // new Date("2023-02-01 00:00:00Z").getTime()
          !isViewed(FeatureId.PLUS_UPDATES_V2)
            ? "New feature"
            : undefined,
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
  };
  const isOpen = visibleSubMenuId === plusMenu.id;

  return (
    <Menu
      menu={plusMenu}
      isActive={isActive}
      isOpen={isOpen}
      toggle={toggleMenu}
    />
  );
};
