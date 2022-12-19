import "./index.scss";
import { usePlusUrl } from "../../../plus/utils";
import { Menu } from "../menu";
import { useIsServer, useLocale } from "../../../hooks";
import { useUserData } from "../../../user-context";

export const PlusMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const plusUrl = usePlusUrl();
  const locale = useLocale();
  const isServer = useIsServer();
  const userData = useUserData();
  const isAuthenticated = userData && userData.isAuthenticated;

  const plusMenu = {
    label: "MDN Plus",
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
      ...(!isServer && isAuthenticated
        ? [
            {
              description: "Your saved articles from across MDN",
              hasIcon: true,
              iconClasses: "submenu-icon",
              label: "Collections",
              url: `/${locale}/plus/collections`,
            },
            {
              description: "Updates from the pages you’re watching",
              hasIcon: true,
              iconClasses: "submenu-icon",
              label: "Notifications",
              url: `/${locale}/plus/notifications`,
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
  };
  const isOpen = visibleSubMenuId === plusMenu.id;

  return <Menu menu={plusMenu} isOpen={isOpen} toggle={toggleMenu} />;
};
