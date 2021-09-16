import { useLocation } from "react-router-dom";

import { removeSessionStorageData } from "../../../user-context";
import { useCSRFMiddlewareToken, useLocale } from "../../../hooks";

export default function SignOut() {
  const csrfMiddlewareToken = useCSRFMiddlewareToken();
  const locale = useLocale();
  const { pathname } = useLocation();

  let next = pathname || `/${locale}/`;

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

  return (
    <form
      className="sign-out-form"
      method="post"
      action={`${prefix}/users/fxa/login/logout/`}
      onSubmit={() => {
        removeSessionStorageData();
      }}
    >
      {csrfMiddlewareToken && (
        <input
          type="hidden"
          name="csrfmiddlewaretoken"
          value={csrfMiddlewareToken}
        />
      )}
      {/* XXX Here it would be great to link to the account settings page */}
      <input type="hidden" name="next" value={next} />
      {csrfMiddlewareToken && (
        <button type="submit" className="button icon-button outline">
          Sign out
        </button>
      )}
    </form>
  );
}
