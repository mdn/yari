import React, { useState } from "react";

import { Button } from "../../atoms/button";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useLocale } from "../../../hooks";
import useSWR, { mutate } from "swr";

import "./index.scss";
import { NotificationData } from "../../../types/notifications";
import { Link } from "react-router-dom";
import { HEADER_NOTIFICATIONS_MENU_API_URL } from "../../../constants";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

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

  const [isOpen, setIsOpen] = useState<boolean>(false);
  let notificationCount = 0;

  const locale = useLocale();

  const { data, error } = useSWR<NotificationData>(
    HEADER_NOTIFICATIONS_MENU_API_URL,
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
    await mutate(HEADER_NOTIFICATIONS_MENU_API_URL);
    return true;
  }

  function drawNotificationButtonContents() {
    return (
      <>
        <span className="notifications-label">Notifications</span>
        <span
          className={`notifications-count-container${
            notificationCount > 0 ? " has-unread" : ""
          }`}
        >
          {notificationCount}
        </span>
      </>
    );
  }

  return (
    <DropdownMenuWrapper
      className="notifications-menu"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Link to={`/${locale}/plus/notifications/`} className="top-level-entry">
        {drawNotificationButtonContents()}
      </Link>

      <Button
        type="action"
        ariaHasPopup={"menu"}
        ariaControls={menuId}
        extraClasses="notifications-button"
        aria-label={`You currently have ${notificationCount} notifications`}
        ariaExpanded={isOpen || undefined}
        icon="bell"
        onClickHandler={() => {
          setIsOpen(!isOpen);
        }}
      >
        {drawNotificationButtonContents()}
      </Button>

      <DropdownMenu onClose={markNotificationsAsRead}>
        <ul
          className={`notifications-submenu ${menuId} show`}
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
                      href={`/${locale}/plus/notifications/`}
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
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
};
