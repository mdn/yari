import * as React from "react";

import Dropdown from "./dropdown";
import { useLocale } from "../hooks";
import SignInLink from "./signin-link";
import { getAuthURL } from "./auth-link";
import { useUserData } from "../user-context";

import avatarImage from "./avatar.png";
import { DISABLE_AUTH } from "../constants";

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
    <img
      src={userData.avatarUrl || avatarImage}
      className="avatar"
      alt={userData.username}
    />
  );
  const viewProfileLink = getAuthURL(
    `/${locale}/profiles/${userData.username}`,
    false
  );
  return (
    <div className="auth-container">
      <Dropdown
        id="user-avatar-menu"
        label={label}
        right={true}
        hideArrow={true}
      >
        {!!userData.wikiContributions && (
          <li>
            <a
              href={getAuthURL(
                `/${locale}/dashboards/revisions?user=${encodeURIComponent(
                  userData.username
                )}`
              )}
              title={`You have ${
                userData.wikiContributions &&
                userData.wikiContributions.toLocaleString()
              } Wiki revisions`}
            >
              Contributions
            </a>
          </li>
        )}
        <li>
          <a href={viewProfileLink}>{"View profile"}</a>
        </li>
        <li>
          <a href={`${viewProfileLink}/edit`}>{"Edit profile"}</a>
        </li>
        <li>
          <form action={getAuthURL(`/${locale}/users/signout`)} method="post">
            <input name="next" type="hidden" value={LOCATION} />
            <button className="signout-button" type="submit">
              Sign out
            </button>
          </form>
        </li>
      </Dropdown>
    </div>
  );
}
