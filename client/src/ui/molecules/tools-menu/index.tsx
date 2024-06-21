import { useLocale } from "../../../hooks";
import { Menu } from "../menu";

import "./index.scss";

export const ToolsMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();

  const menu = {
    id: "tools",
    label: (
      <>
        Tools <sup className="new">New</sup>
      </>
    ),
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
        label: "HTTP Observatory",
        url: `/${locale}/observatory`,
        dot: "New",
      },
      {
        description: "Get real-time assistance",
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
