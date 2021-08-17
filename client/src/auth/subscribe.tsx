import { useSearchParams } from "react-router-dom";

import { DISABLE_AUTH } from "../constants";
import { useUserData } from "../user-context";
import { useLocale } from "../hooks";
import { AuthDisabled } from "../ui/atoms/auth-disabled";
import { Loading } from "../ui/atoms/loading";

import "./index.scss";
// import "./subscribe.scss";

const SUBSCRIBE_URL = "/users/subplat/subscribe/";
const SETTINGS_URL = "/users/subplat/settings/";

export default function SubscribeApp() {
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
  // // When doing local development with Yari, the link to authenticate in Kuma
  // // needs to be absolute. And we also need to send the absolute URL as the
  // // `next` query string parameter so Kuma sends us back when the user has
  // // authenticated there.
  // if (
  //   process.env.NODE_ENV === "development" &&
  //   process.env.REACT_APP_KUMA_HOST
  // ) {
  //   const combined = new URL(next, window.location.href);
  //   next = combined.toString();
  //   prefix = `http://${process.env.REACT_APP_KUMA_HOST}`;
  // }
  sp.set("next", next);

  if (DISABLE_AUTH) {
    return <AuthDisabled />;
  }

  if (!userData) {
    return <Loading />;
  }

  if (userData.isSubscriber) {
    return (
      <div>
        <h4>You're already a wonderful subscriber</h4>
        <p>
          <a href={`${prefix}${SETTINGS_URL}?${sp.toString()}`}>
            Manage your paid subscription
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        <a href={`${prefix}${SUBSCRIBE_URL}?${sp.toString()}`}>
          Sign up for MDN Plus
        </a>
      </p>
    </div>
  );
}
