import { useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { FXA_SIGNIN_URL, KUMA_HOST } from "../../../env";

import "./index.scss";

export default function SignInLink() {
  const locale = useLocale();
  const { pathname } = useLocation();
  const sp = new URLSearchParams();

  let next = pathname || `/${locale}/`;
  sp.set("next", next);

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
    <a
      href={`${prefix}${FXA_SIGNIN_URL}?${sp.toString()}`}
      className="signin-link"
      rel="nofollow"
    >
      Already a subscriber?
    </a>
  );
}
