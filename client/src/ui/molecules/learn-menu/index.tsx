import { useLocale } from "../../../hooks";
import { Menu } from "../menu";

import "./index.scss";

export const LearnMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();

  const menu = {
    id: "learn",
    label: "Learn",
    to: `/${locale}/docs/Learn_web_development`,
    items: [
      {
        description: "Learn web development",
        hasIcon: true,
        extraClasses: "apis-link-container mobile-only",
        iconClasses: "submenu-icon learn",
        label: "Overview / MDN Learning Area",
        url: `/${locale}/docs/Learn_web_development`,
      },
      {
        description: "Learn web development",
        extraClasses: "apis-link-container desktop-only",
        hasIcon: true,
        iconClasses: "submenu-icon learn",
        label: "MDN Learning Area",
        url: `/${locale}/docs/Learn_web_development`,
      },
      {
        description: "Learn to structure web content with HTML",
        extraClasses: "html-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon html",
        label: "HTML",
        url: `/${locale}/docs/Learn_web_development/Core/Structuring_content`,
      },
      {
        description: "Learn to style content using CSS",
        extraClasses: "css-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon css",
        label: "CSS",
        url: `/${locale}/docs/Learn_web_development/Core/Styling_basics`,
      },
      {
        description: "Learn to run scripts in the browser",
        extraClasses: "javascript-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon javascript",
        label: "JavaScript",
        url: `/${locale}/docs/Learn_web_development/Core/Scripting`,
      },
      {
        description: "Learn to make the web accessible to all",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "Accessibility",
        url: `/${locale}/docs/Learn_web_development/Core/Accessibility`,
      },
    ],
  };
  const isOpen = visibleSubMenuId === menu.id;

  return <Menu menu={menu} isOpen={isOpen} toggle={toggleMenu} />;
};
