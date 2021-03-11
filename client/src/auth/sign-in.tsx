import { useSearchParams } from "react-router-dom";

import { useUserData } from "../user-context";
import { useLocale } from "../hooks";

export default function SignInApp() {
  const [searchParams] = useSearchParams();
  const locale = useLocale();
  const userData = useUserData();
  const sp = new URLSearchParams();

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

  // Temporary just long as Kuma still needs to support sign-up both as
  // Kuma front-end (HTML) Yari (redirects).
  // Delete this line once Kuma ONLY deals with Yari in the signup view.
  sp.set("yarisignup", "1");

  return (
    <div>
      {/* We need to wait for the userData (/api/v1/whoami) because it will
          determine what we display.
          We *could* render on the optimism that people most likely will be
          on this page because they're NOT signed in. But it feels a bit
          "ugly" if a page has to change its mind and rerender something
          completely different without it being due to a user action.
      */}
      {userData ? (
        <>
          {userData.isAuthenticated ? (
            <form method="post" action={`${prefix}/${locale}/users/signout`}>
              <p>
                You're <b>already signed in</b>.
              </p>

              {/* XXX Here it would be great to link to the account settings page */}

              <input type="hidden" name="next" value={next} />
              <button type="submit" className="button">
                Sign out
              </button>
              <p>
                Or, <a href="/">return to the home page</a>.
              </p>
            </form>
          ) : (
            <ul>
              <li>
                <a href={`${prefix}/users/github/login/?${sp.toString()}`}>
                  GitHub&trade;
                </a>
              </li>
              <li>
                <a href={`${prefix}/users/google/login/?${sp.toString()}`}>
                  Google&trade;
                </a>
              </li>
            </ul>
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

function Loading() {
  return <p style={{ minHeight: 200 }}>Loading...</p>;
}
