import * as React from "react";

import Dropdown from "../dropdown";
import { useLocale } from "../../../hooks";
import SignInLink from "../../atoms/signin-link";
import { getAuthURL } from "../../../utils/auth-link";
import { useUserData } from "../../../user-context";

import avatarImage from "../../../assets/avatar.png";
import { DISABLE_AUTH } from "../../../constants";

import "./index.scss";

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
  const locale = useLocale();
  const userData = useUserData();

  // if we don't have the user data yet, don't render anything
  if (!userData || typeof window === "undefined") {
    return null;
  }

  // In order to render links properly, we need to know our own URL.
  // We get this from window.location. This is not available during
  // server side rendering, but this code will never run during
  // server side rendering because we won't have user data then.
  const LOCATION = window.location.pathname;

  if (!(userData.isAuthenticated && userData.username)) {
    // Otherwise, show a login prompt
    return <SignInLink className="signin-link" />;
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
      <span className="avatar-username">{userData.username}</span>
    </>
  );
  const viewProfileURL = getAuthURL(
    `/${locale}/profiles/${userData.username}`,
    false
  );
  const editProfileURL = viewProfileURL + "/edit";
  return (
    <Dropdown id="user-avatar-menu" label={label} right={true} hideArrow={true}>
      <li>
        <a href={editProfileURL}>Edit profile</a>
      </li>
      <li>
        <a href={viewProfileURL}>View profile</a>
      </li>
      <li>
        <form action={getAuthURL(`/${locale}/users/signout`)} method="post">
          <input name="next" type="hidden" value={LOCATION} />
          <button className="ghost signout-button" type="submit">
            Sign out
          </button>
        </form>
      </li>
    </Dropdown>
  );
}
