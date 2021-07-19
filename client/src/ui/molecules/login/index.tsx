import * as React from "react";

import Dropdown from "../dropdown";
import { useLocale } from "../../../hooks";
import SignInLink from "../../atoms/signin-link";
import { useUserData, removeSessionStorageData } from "../../../user-context";

import { DISABLE_AUTH } from "../../../constants";

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
  const locale = useLocale();
  const userData = useUserData();

  // if we don't have the user data yet, don't render anything
  if (!userData || typeof window === "undefined") {
    return null;
  }

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
  // Note that this component is never rendered server-side so it's safe to
  // rely on `window.location`.
  let next = window.location.pathname;
  let signOutURL = `/${locale}/users/signout`;
  if (
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_KUMA_HOST
  ) {
    const combined = new URL(next, window.location.href);
    next = combined.toString();
    signOutURL = `http://${process.env.REACT_APP_KUMA_HOST}${signOutURL}`;
  }

  return (
    <Dropdown id="user-avatar-menu" label={label} right={true} hideArrow={true}>
      <li>
        <a href={`/${locale}/settings`}>Account settings</a>
      </li>
      <li>
        <form
          action={signOutURL}
          method="post"
          onSubmit={() => {
            // Because sign out happens externally, our user-context might have
            // cached the fact that the user was signed in. It will not have any
            // chance of knowing, that the user signed out, until they're
            // redirected back (after the successful signout POST in Kuma).
            // So we take this opportunity to invalidate any such caching.
            removeSessionStorageData();
          }}
        >
          <input name="next" type="hidden" value={next} />
          <button className="ghost signout-button" type="submit">
            Sign out
          </button>
        </form>
      </li>
    </Dropdown>
  );
}
