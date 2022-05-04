import { useUserData } from "../../../user-context";
import { useLocale } from "../../../hooks";

import "./index.scss";
import { usePlusUrl } from "../../../plus/utils";
import { Menu } from "../menu";

export const PlusMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();
  const userData = useUserData();

  const plusUrl = usePlusUrl();

  const isAuthenticated = userData && userData.isAuthenticated;

  const plusMenu = {
    label: "MDN Plus",
    id: "mdn-plus",
    to: plusUrl,
    items: [
      {
        description: "More MDN. Your MDN.",
        hasIcon: true,
        extraClasses: "mobile-only",
        iconClasses: "submenu-icon",
        label: "Overview",
        url: plusUrl,
      },
      ...(isAuthenticated
        ? [
            {
              description: "Your saved articles from across MDN",
              hasIcon: true,
              iconClasses: "submenu-icon bookmarks-icon",
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
