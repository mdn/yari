import { useEffect, useState } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/avatar'. Did you m... Remove this comment to see the full error message
import { Avatar } from "../../atoms/avatar";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/button'. Did you m... Remove this comment to see the full error message
import { Button } from "../../atoms/button";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../submenu'. Did you mean to s... Remove this comment to see the full error message
import { Submenu } from "../submenu";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/signout'. Did you ... Remove this comment to see the full error message
import SignOut from "../../atoms/signout";

import { useUserData } from "../../../user-context";
import { useIsServer, useLocale } from "../../../hooks";
import {
  FXA_SETTINGS_URL,
  HEADER_NOTIFICATIONS_MENU_API_URL,
  FXA_MANAGE_SUBSCRIPTIONS_URL,
} from "../../../constants";

import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../dropdown'. Did you mean to ... Remove this comment to see the full error message
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";
import { NotificationData } from "../../../types/notifications";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'swr'. Did you mean to set the ... Remove this comment to see the full error message
import useSWR from "swr";

export const UserMenu = () => {
  const userData = useUserData();
  const locale = useLocale();
  const isServer = useIsServer();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [newNotifications, setNewNotifications] = useState<boolean>(false);
  const { data } = useSWR<NotificationData>(
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
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    setNewNotifications(Boolean(data?.items.length));
  }, [data]);

  // if we don't have the user data yet, don't render anything
  if (!userData || isServer) {
    return null;
  }

  const userMenuItems = {
    label: "My MDN Plus",
    id: "my-mdn-plus",
    items: [
      {
        label: userData.email || "",
        extraClasses: "submenu-header",
      },
      {
        label: "Notifications",
        url: `/${locale}/plus/notifications`,
        dot: newNotifications ? "New notifications" : undefined,
      },
      {
        label: "Collections",
        url: `/${locale}/plus/collections`,
      },
      {
        label: "MDN Offline",
        url: "/en-US/plus/offline",
      },
      {
        url: FXA_SETTINGS_URL,
        label: "Manage account",
      },
      {
        url: FXA_MANAGE_SUBSCRIPTIONS_URL,
        label: "Manage subscription",
      },
      {
        url: "https://support.mozilla.org/products/mdn-plus",
        label: "Help",
      },
      {
        url: "https://github.com/mdn/MDN-feedback",
        label: "Feedback",
      },
      {
        component: SignOut,
        extraClasses: "signout-container",
      },
    ],
  };

  return (
    <DropdownMenuWrapper
      className="top-level-entry-container user-menu"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Button
        type="action"
        id={`${userMenuItems.id}-button`}
        extraClasses="top-level-entry menu-toggle user-menu-toggle"
        ariaControls={userMenuItems.id}
        ariaHasPopup="menu"
        ariaExpanded={isOpen || undefined}
        onClickHandler={() => {
          setIsOpen(!isOpen);
        }}
      >
        {newNotifications && (
          <span className="visually-hidden notification-dot">
            New notifications received.
          </span>
        )}
        <Avatar userData={userData} />
        <span className="user-menu-id">{userData.email}</span>
      </Button>

      <DropdownMenu>
        <Submenu submenuId={userMenuItems.id} menuEntry={userMenuItems} />
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
};
