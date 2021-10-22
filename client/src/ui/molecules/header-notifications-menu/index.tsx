import React from "react";

import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import "./index.scss";
import useSWR from "swr";

dayjs.extend(relativeTime);

interface Notification {
  id: number;
  title: string;
  text: string;
  created: string;
}

interface NotificationData {
  items: Array<Notification>;
  csrfmiddlewaretoken: string;
}

export const HeaderNotificationsMenu = () => {
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  const apiURL = "/api/v1/plus/notifications/?per_page=5";
  const { data, error } = useSWR<NotificationData>(
    apiURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: true,
    }
  );

  if (error) {
    return <div>API Error (ToDo)</div>;
  }

  if (!data) {
    return <div>No data yet (ToDo)</div>;
  }

  console.log(data.items);

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
      ...data.items.map((item) => {
        return {
          id: item.id,
          url: `/notifications/${item.id}/`,
          label: item.text,
          description: item.title,
          subText: dayjs(item.created).toString(),
        };
      }),
    ],
  };

  const notificationCount = notificationsMenuItems.items.length;

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
