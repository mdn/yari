import { useLocale } from "../../../hooks";
import { Menu } from "../menu";

import "./index.scss";

export const ReferenceMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();

  const menu = {
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
  };

  const isOpen = visibleSubMenuId === menu.id;

  return <Menu menu={menu} isOpen={isOpen} toggle={toggleMenu} />;
};
