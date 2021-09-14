import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import useSWR from "swr";

import { DISABLE_AUTH } from "../constants";
import { useUserData, removeSessionStorageData } from "../user-context";
import { useCSRFMiddlewareToken, useLocale } from "../hooks";
import { AuthDisabled } from "../ui/atoms/auth-disabled";
import SignOut from "../ui/atoms/signout";

import "./index.scss";
import "./sign-out.scss";

interface UserSettings {
  csrfmiddlewaretoken: string;
}

export default function SignOutApp() {
  const [searchParams] = useSearchParams();
  const locale = useLocale();
  const userData = useUserData();
  const sp = new URLSearchParams();
  const csrfMiddlewareToken = useCSRFMiddlewareToken();

  // This is the `?next=` parameter we send into the redirect loop IF you did
  // not click into this page from an existing one.
  const defaultNext = `/${locale}/`;

  let next = searchParams.get("next") || defaultNext;
  if (next.toLowerCase() === window.location.pathname.toLowerCase()) {
    // It's never OK for the ?next= variable to be to come back here to this page.
    // Explicitly check that.
    next = defaultNext;
  }

  let prefix = "";
  // When doing local development with Yari, the link to authenticate in Kuma
  // needs to be absolute. And we also need to send the absolute URL as the
  // `next` query string parameter so Kuma sends us back when the user has
  // authenticated there.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_KUMA_HOST
  ) {
    const combined = new URL(next, window.location.href);
    next = combined.toString();
    prefix = `http://${process.env.REACT_APP_KUMA_HOST}`;
  }
  sp.set("next", next);

  if (DISABLE_AUTH) {
    return <AuthDisabled />;
  }

  return (
    <>
      {/* We need to wait for the userData (/api/v1/whoami) because it will
          determine what we display.
          We *could* render on the optimism that people most likely will be
          on this page because they're NOT signed in. But it feels a bit
          "ugly" if a page has to change its mind and rerender something
          completely different without it being due to a user action.
      */}
      {userData ? (
        userData.isAuthenticated ? (
          <SignOut />
        ) : (
          <>
            <p>
              <b>You're not signed in.</b> Yet.
            </p>
            <p>
              <Link to={`/${locale}/signin`}>Click here to sign in</Link>
            </p>
          </>
        )
      ) : (
        <Loading />
      )}
    </>
  );
}

function Loading() {
  return <p style={{ minHeight: 200 }}>Loading...</p>;
}
