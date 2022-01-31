import * as React from "react";
import { useState } from "react";

import { useUserData } from "../../../user-context";
import { useLocale } from "../../../hooks";

import { Link } from "react-router-dom";
import { Submenu } from "../submenu";

import "./index.scss";

export const PlusMenu = () => {
  const locale = useLocale();
  const userData = useUserData();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const plusMenu = {
    label: "MDN Plus",
    id: "mdn-plus",
    items: [
      {
        description: "Collect articles from across MDN",
        hasIcon: true,
        iconClasses: "submenu-icon bookmarks-icon",
        label: "My Collection",
        url: `/${locale}/plus/bookmarks`,
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
  const isSubscriber = userData && userData.isSubscriber;

  return isSubscriber ? (
    <li key={plusMenu.id} className="top-level-entry-container">
      <button
        id={`${plusMenu.id}-button`}
        className="top-level-entry menu-toggle"
        aria-haspopup="menu"
        aria-expanded={isOpen || undefined}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {plusMenu.label}
      </button>

      <Link to={`/${locale}/plus/`} className="top-level-entry">
        {plusMenu.label}
      </Link>

      <Submenu menuEntry={plusMenu} defaultHidden />
    </li>
  ) : (
    <li>
      <a href={`/${locale}/plus`} className="top-level-entry">
        MDN Plus
      </a>
    </li>
  );
};
