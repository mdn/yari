import { useState } from "react";
import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";
import SignOut from "../../atoms/signout";

import { useUserData } from "../../../user-context";
import { useIsServer, useLocale, useViewedState } from "../../../hooks";
import { FeatureId } from "../../../constants";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";
import { NEWSLETTER_ENABLED } from "../../../env";

export const UserMenu = () => {
  const userData = useUserData();
  const locale = useLocale();
  const isServer = useIsServer();
  const { isViewed } = useViewedState();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // if we don't have the user data yet, don't render anything
  if (!userData || isServer) {
    return null;
  }

  const userMenuItems = {
    label: "My MDN Plus",
    id: "user-menu",
    items: [
      {
        label: userData.email || "",
        extraClasses: "submenu-header",
      },
      {
        label: "Collections",
        url: `/${locale}/plus/collections`,
      },
      {
        label: "Updates",
        url: `/${locale}/plus/updates`,
      },
      {
        label: "My Settings",
        url: "/en-US/plus/settings",
        dot:
          NEWSLETTER_ENABLED &&
          userData?.isSubscriber &&
          Date.now() < 1677628799000 && // new Date("2023-02-28 23:59:59Z").getTime()
          !userData?.settings?.mdnplusNewsletter &&
          !isViewed(FeatureId.PLUS_NEWSLETTER)
            ? "New feature"
            : undefined,
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

  const hasAnyDot = userMenuItems.items.some((item) => item.dot);

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
        aria-controls={userMenuItems.id}
        aria-haspopup="menu"
        aria-expanded={isOpen || undefined}
        onClickHandler={() => {
          setIsOpen(!isOpen);
        }}
      >
        {hasAnyDot && <span className="visually-hidden dot">New feature</span>}
        <Avatar userData={userData} />
        <span className="visually-hidden">User menu</span>
        <span className="user-menu-id">{userData.email}</span>
      </Button>

      <DropdownMenu>
        <Submenu
          submenuId={userMenuItems.id}
          menuEntry={userMenuItems}
          extraClasses="inline-submenu-lg"
        />
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
};
