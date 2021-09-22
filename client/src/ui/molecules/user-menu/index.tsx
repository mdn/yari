import React from "react";
import { styled } from "linaria/react";

import Dropdown from "../dropdown";
import SignOut from "../../atoms/signout";

import { useUserData } from "../../../user-context";
import { FXA_SETTINGS_URL } from "../../../constants";

export default function UserMenu() {
  const [forceCloseDropdown, setForceCloseDropdown] = React.useState(false);

  const avatarImage = `${process.env.PUBLIC_URL || ""}/assets/avatar.png`;
  const userData = useUserData();

  // if we don't have the user data yet, don't render anything
  if (!userData || typeof window === "undefined") {
    return null;
  }

  const Avatar = styled.img`
    border-radius: 50%;
    height: 40px;
    /* avoid click events being sent from
     the avatar image */
    pointer-events: none;
    width: 40px;
  `;

  // If we have user data and the user is logged in, show their
  // profile pic, defaulting to the dino head if the avatar
  // URL doesn't work.
  const label = (
    <>
      <Avatar
        src={userData.avatarUrl || avatarImage}
        alt={userData.username || ""}
      />
      <span className="avatar-username visually-hidden">
        {userData.username}
      </span>
    </>
  );

  return (
    <Dropdown
      componentClassName="auth-container"
      id="user-avatar-menu"
      label={label}
      right={true}
      hideArrow={true}
      forceClose={forceCloseDropdown}
    >
      <li>
        <a
          href={FXA_SETTINGS_URL}
          onClick={() => {
            setForceCloseDropdown(true);
          }}
        >
          Account settings
        </a>
      </li>
      <li>
        <SignOut />
      </li>
    </Dropdown>
  );
}
