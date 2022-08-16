import { useLocation } from "react-router-dom";

import { cleanupUserData } from "../../../user-context";
import { useLocale } from "../../../hooks";
import { KUMA_HOST } from "../../../env";

import "./index.scss";
import { Button } from "../button";

export default function SignOut() {
  const locale = useLocale();
  const { pathname } = useLocation();

  let next = pathname || `/${locale}/`;

  let prefix = "";
  // When doing local development with Yari, the link to authenticate in Kuma
  // needs to be absolute. And we also need to send the absolute URL as the
  // `next` query string parameter so Kuma sends us back when the user has
  // authenticated there.
  if (process.env.NODE_ENV === "development") {
    const combined = new URL(next, window.location.href);
    next = combined.toString();
    prefix = `http://${KUMA_HOST}`;
  }

  return (
    <form
      className="signout-form"
      method="post"
      action={`${prefix}/users/fxa/login/logout/`}
      onSubmit={() => {
        cleanupUserData();
      }}
    >
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
