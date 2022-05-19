// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { useLocation } from "react-router-dom";

import { removeSessionStorageData } from "../../../user-context";
import { useCSRFMiddlewareToken, useLocale } from "../../../hooks";

import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../button'. Did you mean to se... Remove this comment to see the full error message
import { Button } from "../button";

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
      className="signout-form"
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
      <input type="hidden" name="next" value={next} />
      <Button
        type="secondary"
        buttonType="submit"
        extraClasses="signout-button"
      >
        Sign Out
      </Button>
    </form>
  );
}
