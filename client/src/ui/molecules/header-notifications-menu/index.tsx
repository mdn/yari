import React from "react";

import { Button } from "../../atoms/button";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useLocale } from "../../../hooks";
import useSWR, { mutate } from "swr";

import "./index.scss";
import { NotificationData } from "../../../types/notifications";

dayjs.extend(relativeTime);

type NotificationMenuItem = {
  id: number;
  read: boolean;
  description?: string;
  label: string;
  created: Date;
  url: string;
};

export const HeaderNotificationsMenu = () => {
  const menuId = "my-notifications";

  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );
  let notificationCount = 0;

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
        label: item.title,
        description: item.text,
        created: item.created,
      };
    });

    notificationsMenuItems.push(...notifications);

    notificationCount = notifications.reduce(
      (n, item) => (item.read === false ? ++n : n),
      0
    );
  }

  async function markNotificationsAsRead() {
    if (!data) {
      return null;
    }

    const apiPostURL = `/api/v1/plus/notifications/all/mark-as-read/`;

    const response = await fetch(apiPostURL, {
      method: "POST",
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
    await mutate(apiURL);
    return true;
  }

  /**
   * Show and hide submenus in the main menu
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    if (visibleSubMenuId === menuEntryId) {
      setVisibleSubMenuId(null);
      // User has closed the menu, so mark all notifications as read
      markNotificationsAsRead();
    } else {
      setVisibleSubMenuId(menuEntryId);
    }
  }

  return (
    <div className="notifications-menu">
      <Button
        type="action"
        ariaHasPopup={"menu"}
        ariaControls={menuId}
        extraClasses="top-level-entry notifications-button"
        aria-label={`You currently have ${notificationCount} notifications`}
        ariaExpanded={menuId === visibleSubMenuId}
        icon="bell"
        onClickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        <span className="notifications-label">Notifications</span>
        <span
          className={`notifications-count-container${
            notificationCount > 0 ? " has-unread" : ""
          }`}
        >
          {notificationCount}
        </span>
      </Button>

      <ul
        className={`notifications-submenu ${menuId} ${
          menuId === visibleSubMenuId ? "show" : ""
        }`}
        role="menu"
        aria-labelledby={`${menuId}-button`}
      >
        {notificationsMenuItems.length > 0 ? (
          <>
            <li className="notifications-submenu-header">
              <div className="notifications-submenu-item-heading">
                Notifications
              </div>
              <a
                href={`/${locale}/plus/notifications/`}
                className="notifications-submenu-header-action"
              >
                View all
              </a>
            </li>

            {notificationsMenuItems.map((notification) => {
              return (
                <li key={`${menuId}-${notification.id}`}>
                  <a
                    href={notification.url}
                    role="menuitem"
                    className={`notifications-submenu-action ${
                      !notification.read ? "unread" : ""
                    }`}
                  >
                    <div className="notifications-submenu-item-heading">
                      {notification.label}
                    </div>
                    {notification.description && (
                      <p className="notifications-submenu-item-description">
                        {notification.description}
                      </p>
                    )}

                    <time
                      className="notifications-submenu-item-created"
                      dateTime={dayjs(notification.created).toISOString()}
                    >
                      {dayjs(notification.created).fromNow().toString()}
                    </time>
                  </a>
                </li>
              );
            })}
          </>
        ) : (
          <div className="notifications-submenu-empty-message">
            <a href={`/${locale}/plus/notifications/`}>
              No notifications yet. Get started.
            </a>
          </div>
        )}
      </ul>
    </div>
  );
};
