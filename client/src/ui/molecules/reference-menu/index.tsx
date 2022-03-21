import * as React from "react";
import { Link } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { Submenu } from "../submenu";

import "./index.scss";

export const ReferenceMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();

  const menu = {
    label: "References",
    id: "references",
    items: [
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
        description: "Web technology reference for developers",
        extraClasses: "apis-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "Web Technology",
        url: `/${locale}/docs/Web`,
      },
    ],
  };
  const isOpen = visibleSubMenuId === menu.id;

  return (
    <li key={menu.id} className="top-level-entry-container">
      <button
        type="button"
        id={`${menu.id}-button`}
        className="top-level-entry menu-toggle"
        aria-haspopup="menu"
        aria-expanded={isOpen || undefined}
        onClick={() => {
          toggleMenu(menu.id);
        }}
      >
        {menu.label}
      </button>

      <Link
        to={`/${locale}/docs/Web`}
        className="top-level-entry"
        // @ts-ignore
        onClick={() => document?.activeElement?.blur()}
      >
        {menu.label}
      </Link>

      <Submenu menuEntry={menu} defaultHidden={!isOpen} />
    </li>
  );
};
