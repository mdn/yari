import { useLocale } from "../../../hooks";

import "./index.scss";
import { usePlusUrl } from "../../../plus/utils";
import { Menu } from "../menu";

export const PlusMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();
  const plusUrl = usePlusUrl();

  const plusMenu = {
    label: "MDN Plus",
    id: "mdn-plus",
    to: plusUrl,
    items: [
      {
        description: "Collections and Notifications moved to the user menu",
        extraClasses: "note",
      },
      {
        description: "A customized MDN experience",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "Overview",
        url: plusUrl,
      },
      {
        description: "Learn how to use MDN Plus",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "Documentation",
        url: `/${locale}/plus/docs/features/overview`,
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
