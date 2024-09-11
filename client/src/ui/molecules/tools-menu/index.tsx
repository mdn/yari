import { OBSERVATORY_TITLE } from "../../../../../libs/constants";
import { useLocale } from "../../../hooks";
import { Menu } from "../menu";

import "./index.scss";

export const ToolsMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();

  const menu = {
    id: "tools",
    label: <>Tools</>,
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
  };
  const isOpen = visibleSubMenuId === menu.id;

  return <Menu menu={menu} isOpen={isOpen} toggle={toggleMenu} />;
};
