import * as React from "react";

import { useUserData } from "../../../user-context";
import { useLocale } from "../../../hooks";

import { Link } from "react-router-dom";
import { Submenu } from "../submenu";

import "./index.scss";

export const PlusMenu = ({ visibleSubMenuId, toggleMenu }) => {
  const locale = useLocale();
  const userData = useUserData();

  const plusMenu = {
    label: "MDN Plus",
    id: "mdn-plus",
    items: [
      {
        description: "Collect articles from across MDN",
        hasIcon: true,
        iconClasses: "submenu-icon bookmarks-icon",
        label: "My Collection",
        url: `/${locale}/plus/collection`,
      },
      {
        description: "Stay up to date with MDN content",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "My Notifications",
        url: `/${locale}/plus/notifications`,
      },
      {
        description: "Learn more about your MDN Plus Subscription",
        hasIcon: true,
        iconClasses: "submenu-icon",
        label: "About MDN Plus",
        url: `/${locale}/plus/`,
      },
    ],
  };
  const isOpen = visibleSubMenuId === plusMenu.id;
  const isAuthenticated = userData && userData.isAuthenticated;

  return isAuthenticated ? (
    <li key={plusMenu.id} className="top-level-entry-container">
      <button
        id={`${plusMenu.id}-button`}
        className="top-level-entry menu-toggle"
        aria-haspopup="menu"
        aria-expanded={isOpen || undefined}
        onClick={() => {
          toggleMenu(plusMenu.id);
        }}
      >
        {plusMenu.label}
      </button>

      <Link to={`/${locale}/plus/`} className="top-level-entry">
        {plusMenu.label}
      </Link>

      <Submenu menuEntry={plusMenu} defaultHidden={!isOpen} />
    </li>
  ) : (
    <li>
      <a href={`/${locale}/plus`} className="top-level-entry">
        MDN Plus
      </a>
    </li>
  );
};
