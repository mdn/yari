import React from "react";

import { Button } from "../../atoms/button";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useLocale } from "../../../hooks";

import "./index.scss";
import useSWR from "swr";

dayjs.extend(relativeTime);

interface Notification {
  id: number;
  title: string;
  text: string;
  created: string;
  read: boolean;
}

type NotificationMenuItem = {
  id?: number;
  read?: boolean;
  description?: string;
  extraClasses?: string;
  label?: string;
  created?: string;
  url?: string;
};

interface NotificationData {
  items: Array<Notification>;
  csrfmiddlewaretoken: string;
}

export const HeaderNotificationsMenu = () => {
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  let notificationCount = 0;
  const notificationMenuId = "my-notifications";

  const locale = useLocale();

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

  let notificationsMenuItems: Array<NotificationMenuItem> = [];

  if (data && !error) {
    const notifications = data.items.map((item) => {
      return {
        id: item.id,
        url: `/${locale}/plus/notifications/${item.id}/`,
        read: item.read,
        label: item.text,
        description: item.title,
        created: dayjs(item.created).toString(),
        extraClasses: !item.read ? "unread-notification" : "",
      };
    });

    notificationsMenuItems.push(...notifications);

    notificationCount = notifications.reduce(
      (n, item) => (item.read === false ? ++n : n),
      0
    );
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
        ariaControls={notificationMenuId}
        extraClasses="ghost notifications-button"
        aria-label={`You currently have ${notificationCount} notifications`}
        ariaExpanded={notificationMenuId === visibleSubMenuId}
        onClickHandler={(event) => {
          toggleSubMenu(event, notificationMenuId);
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

      <ul
        className={`submenu ${notificationMenuId} ${
          notificationMenuId === visibleSubMenuId ? "show" : ""
        }`}
        role="menu"
        aria-labelledby={`${notificationMenuId}-button`}
      >
        {notificationsMenuItems.length > 0 ? (
          <>
            <li className="submenu-header submenu-content-container">
              <div className="submenu-item-heading">Notifications</div>
              <a
                href={`/${locale}/plus/notifications/`}
                className="submenu-header-action"
              >
                View all
              </a>
            </li>

            {notificationsMenuItems.map((notification) => {
              return (
                <li key={`my-notifications-${notification.id}`}>
                  <a
                    href={notification.url}
                    role="menuitem"
                    className="submenu-content-container"
                  >
                    <div className="submenu-item-heading">
                      {notification.label}
                    </div>
                    {notification.description && (
                      <p className="submenu-item-description">
                        {notification.description}
                      </p>
                    )}
                    <span className="submenu-item-subtext">
                      {notification.created}
                    </span>
                  </a>
                </li>
              );
            })}
          </>
        ) : (
          <div className="submenu-empty-message">
            <a href={`/${locale}/plus/notifications/`}>
              No notifications yet. Get started.
            </a>
          </div>
        )}
      </ul>
    </div>
  );
};
