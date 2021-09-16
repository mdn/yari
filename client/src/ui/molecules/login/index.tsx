import React from "react";

import Dropdown from "../dropdown";
import SignInLink from "../../atoms/signin-link";
import SignOut from "../../atoms/signout";
import { useUserData } from "../../../user-context";

import { DISABLE_AUTH, FXA_SETTINGS_URL } from "../../../constants";

import "./index.scss";

const avatarImage = `${process.env.PUBLIC_URL || ""}/assets/avatar.png`;

export default function Login() {
  // For example, if you're using Yari purely for previewing your content edits,
  // it might not make sense to do any auth.
  if (DISABLE_AUTH) {
    return null;
  }
  // The reason the <Login/> wraps <LoginInner/> is to be able to
  // potentially exit early depending on `DISABLE_AUTH`.
  return <LoginInner />;
}

function LoginInner() {
  const userData = useUserData();

  const [forceCloseDropdown, setForceCloseDropdown] = React.useState(false);

  // if we don't have the user data yet, don't render anything
  if (!userData || typeof window === "undefined") {
    return null;
  }

  if (!(userData.isAuthenticated && userData.username)) {
    // Otherwise, show a login prompt
    return <SignInLink />;
  }

  // If we have user data and the user is logged in, show their
  // profile pic, defaulting to the dino head if the avatar
  // URL doesn't work.
  const label = (
    <>
      <img
        src={userData.avatarUrl || avatarImage}
        className="avatar"
        alt={userData.username}
      />
      <span className="avatar-username visually-hidden">
        {userData.username}
      </span>
    </>
  );

  return (
    <Dropdown
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
