import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { Submenu } from "../submenu";

import "./index.scss";

export const ReferenceMenu = () => {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menu = {
    label: "References",
    id: "references",
    items: [
      {
        description: "Most basic building block of the Web",
        extraClasses: "html-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon html",
        label: "HTML",
        url: `/${locale}/docs/Web/HTML`,
      },
      {
        description: "Code used for describing document styling",
        extraClasses: "css-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon css",
        label: "CSS",
        url: `/${locale}/docs/Web/CSS`,
      },
      {
        description: "Lightweight, interpreted, object-oriented language",
        extraClasses: "javascript-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon javascript",
        label: "JavaScript",
        url: `/${locale}/docs/Web/JavaScript`,
      },
      {
        description: "Protocol for transmitting hypermedia documents",
        extraClasses: "http-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon http",
        label: "HTTP",
        url: `/${locale}/docs/Web/HTTP`,
      },
      {
        description: "Software interface that connects software",
        extraClasses: "apis-link-container",
        hasIcon: true,
        iconClasses: "submenu-icon apis",
        label: "APIs",
        url: `/${locale}/docs/Web/API`,
      },
    ],
  };

  return (
    <li key={menu.id} className="top-level-entry-container">
      <button
        type="button"
        id={`${menu.id}-button`}
        className="top-level-entry menu-toggle"
        aria-haspopup="menu"
        aria-expanded={isOpen || undefined}
        onClick={(event) => {
          setIsOpen(!isOpen);
        }}
      >
        {menu.label}
      </button>

      <Link to={`/${locale}/docs/Web/`} className="top-level-entry">
        {menu.label}
      </Link>

      <Submenu menuEntry={menu} defaultHidden />
    </li>
  );
};
