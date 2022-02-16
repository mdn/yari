import { useLocation } from "react-router-dom";

import { removeSessionStorageData } from "../../../user-context";
import { useCSRFMiddlewareToken, useLocale } from "../../../hooks";

import "./index.scss";
import { Button } from "../button";
import { MDN_APP_ANDROID } from "../../../constants";

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

  if (MDN_APP_ANDROID) {
    const signOut = async () => {
      await window.Android.signOut();
    };
    return (
      <form className="sign-out-form">
        <Button
          onClickHandler={signOut}
          type="secondary"
          extraClasses="signout-button"
        >
          Sign out
        </Button>
      </form>
    );
  } else {
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
        {/* XXX Here it would be great to link to the account settings page */}
        <input type="hidden" name="next" value={next} />
        {csrfMiddlewareToken && (
          <Button
            type="secondary"
            buttonType="submit"
            extraClasses="signout-button"
          >
            Sign Out
          </Button>
        )}
      </form>
    );
  }
}
