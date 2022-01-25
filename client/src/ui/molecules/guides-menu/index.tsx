import * as React from "react";
import { Link } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { Submenu } from "../submenu";

import "./index.scss";
import { useState } from "react";

export const GuidesMenu = () => {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menu = {
    label: "Guides",
    id: "guides",
    items: [
      {
        label: "Learn web development",
        url: `/${locale}/docs/Learn`,
      },
      {
        label: "HTML",
        url: `/${locale}/docs/Learn/HTML`,
      },
      {
        label: "CSS",
        url: `/${locale}/docs/Learn/CSS`,
      },
      {
        label: "JavaScript",
        url: `/${locale}/docs/Learn/JavaScript`,
      },
      {
        label: "Web Forms",
        url: `/${locale}/docs/Learn/Forms`,
      },
      {
        label: "Accessability",
        url: `/${locale}/docs/Web/Accessibility`,
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
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {menu.label}
      </button>

      <Link to={`/${locale}/docs/Web/`} className="top-level-entry">
        Guides
      </Link>

      <Submenu menuEntry={menu} defaultHidden />
    </li>
  );
};
