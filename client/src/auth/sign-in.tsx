import React from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";

import { DISABLE_AUTH } from "../constants";
import { useUserData, removeSessionStorageData } from "../user-context";
import { useLocale } from "../hooks";
import { AuthDisabled } from "../ui/atoms/auth-disabled";

// import { ReactComponent as GithubLogo } from "@mdn/dinocons/brands/github-mark-small.svg";
// import { ReactComponent as GoogleLogo } from "@mdn/dinocons/brands/google-mono.svg";

import "./index.scss";
import "./sign-in.scss";

interface UserSettings {
  csrfmiddlewaretoken: string;
}

export default function SignInApp() {
  const [searchParams] = useSearchParams();
  const locale = useLocale();
  const userData = useUserData();
  const sp = new URLSearchParams();

  // If it turns out that you're signed in already, the sign-out will require
  // a CSRF token to be able to submit the POST to `/users/*/login/logout`.
  const userSettingsAPIURL = React.useMemo(() => {
    return userData && userData.isAuthenticated ? "/api/v1/settings" : null;
  }, [userData]);
  const { data, error } = useSWR<UserSettings>(
    userSettingsAPIURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      return await response.json();
    }
  );

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
          <form
            className="sign-out-form"
            method="post"
            action="/users/fxa/login/logout/"
          >
            <h2>You're already signed in.</h2>
            {data && data.csrfmiddlewaretoken && (
              <input
                type="hidden"
                name="csrfmiddlewaretoken"
                value={data.csrfmiddlewaretoken}
              />
            )}
            {/* XXX Here it would be great to link to the account settings page */}
            <input type="hidden" name="next" value={next} />
            {error && (
              <div className="notecard negative">
                <p>
                  <strong>Server error</strong> Unable to connect to the server.
                </p>
              </div>
            )}
            {data && data.csrfmiddlewaretoken && (
              <>
                <button type="submit" className="ghost">
                  Sign out
                </button>
                or, <a href="/">return to the home page</a>
              </>
            )}
            .
          </form>
        ) : (
          <>
            {/* <p className="lead">
              Sign in to your MDN Web Docs account. If you haven’t already
              created an account, you will be prompted to do so after signing
              in.
            </p> */}
            <ul className="auth-buttons">
              <li>
                <a
                  href={`${prefix}/users/fxa/login/authenticate/?${sp.toString()}`}
                  className="button icon-button outline"
                  onClick={() => {
                    removeSessionStorageData();
                  }}
                >
                  {/* <FxALogo /> */}
                  Sign in with Firefox Accounts
                </a>
              </li>
              {/* <li>
                <a
                  href={`${prefix}/users/github/login/?${sp.toString()}`}
                  className="button icon-button outline"
                  onClick={() => {
                    removeSessionStorageData();
                  }}
                >
                  <GithubLogo />
                  Sign in with GitHub&trade;
                </a>
              </li> */}
              {/* <li>
                <a
                  href={`${prefix}/users/google/login/?${sp.toString()}`}
                  className="button icon-button outline"
                  onClick={() => {
                    removeSessionStorageData();
                  }}
                >
                  <GoogleLogo />
                  Sign in with Google&trade;
                </a>
              </li> */}
            </ul>
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
