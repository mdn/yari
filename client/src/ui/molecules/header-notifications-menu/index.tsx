import React from "react";

import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useUserData } from "../../../user-context";

import "./index.scss";

dayjs.extend(relativeTime);

export const HeaderNotificationsMenu = () => {
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  const notificationsMenuItems = {
    label: "Notifications",
    id: "my-notifications",
    items: [
      {
        component: () => {
          return (
            <li role="none" className="submenu-header">
              <div className="submenu-content-container">
                <div className="submenu-item-heading">Notifications</div>
                <a href="/notifications/" className="submenu-header-action">
                  View all
                </a>
              </div>
            </li>
          );
        },
      },
      {
        id: "Notification2",
        label: "border-block",
        description: "Now available in multiple browsers",
        subText: dayjs(Date.now()).fromNow(),
      },
      {
        id: "Notification2",
        label: "AggregateError",
        description: "Available now for Deno 1.2",
        subText: dayjs(new Date("10/19/2021")).fromNow(),
      },
      {
        id: "Notification3",
        label: "decodeURI()",
        description: "Deprecated for Node.js 0.09.0",
        subText: dayjs(new Date("10/18/2021")).fromNow(),
      },
    ],
  };

  const notificationCount = 3;

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  /**
   * Show and hide submenus in the main menu, send GA events and updates
   * the ARIA state.
   * @param {Object} event - The event that triggered the function.
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(event, menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  return (
    <div className="notifications-menu">
      <Button
        ariaHasPopup={"menu"}
        extraClasses="ghost notifications-button"
        aria-label={`You currently have ${notificationCount} notifications`}
        ariaExpanded={notificationsMenuItems.id === visibleSubMenuId}
        onClickHandler={(event) => {
          toggleSubMenu(event, notificationsMenuItems.id);
        }}
      >
        <span className="notifications-label">Notifications</span>
        <span
          className={`notifications-count-container ${
            notificationCount > 0 ? "unread-notifications" : ""
          }`}
        >
          <span className="notifications-count">{notificationCount}</span>
        </span>
      </Button>

      {notificationsMenuItems.items.length > 0 ? (
        <Submenu
          menuEntry={notificationsMenuItems}
          visibleSubMenuId={visibleSubMenuId}
          onBlurHandler={hideSubMenuIfVisible}
        />
      ) : (
        <div
          className={`submenu ${notificationsMenuItems.id} ${
            notificationsMenuItems.id === visibleSubMenuId ? "show" : ""
          }`}
          role="menu"
          aria-labelledby={`${notificationsMenuItems.id}-button`}
        >
          <span>No notifications yet. Get started.</span>
        </div>
      )}
    </div>
  );
};
