import { useSearchParams } from "react-router-dom";

import { useUserData } from "../user-context";
import { useLocale } from "../hooks";

export default function SignInApp() {
  const [searchParams] = useSearchParams();
  const locale = useLocale();
  const userData = useUserData();
  const sp = new URLSearchParams();
  let next = searchParams.get("next") || `/${locale}/`;

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
      <h1>Sign in</h1>
      {userData && userData.isAuthenticated ? (
        <form method="post" action={`${prefix}/${locale}/users/signout`}>
          <p>
            You're <b>already signed in</b>.
          </p>
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
    </div>
  );
}
