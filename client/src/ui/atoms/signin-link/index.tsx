import { useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { FXA_SIGNIN_URL, KUMA_HOST } from "../../../env";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";

export default function SignInLink({
  gleanContext,
  cta = "Log in",
}: {
  gleanContext?: string;
  cta?: string;
}) {
  const gleanClick = useGleanClick();

  const href = useLoginUrl();

  return (
    <a
      href={href}
      className="signin-link"
      rel="nofollow"
      onClick={() => gleanContext && gleanClick(gleanContext)}
    >
      {cta}
    </a>
  );
}

export function useLoginUrl() {
  const locale = useLocale();
  const { pathname, search } = useLocation();
  const sp = new URLSearchParams();

  let next = pathname ? pathname + search : `/${locale}/`;
  sp.set("next", encodeURI(next));

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

  return `${prefix}${FXA_SIGNIN_URL}?${sp.toString()}`;
}
