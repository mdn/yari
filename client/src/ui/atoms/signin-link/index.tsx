import { useLocation } from "react-router-dom";
import { styled } from "linaria/react";

import { useLocale } from "../../../hooks";
import { FXA_SIGNIN_URL } from "../../../constants";
import { lightModeTextSecondary } from "../../vars/js/variables";

export default function SignInLink() {
  const locale = useLocale();
  const { pathname } = useLocation();
  const sp = new URLSearchParams();

  const SignIn = styled.a`
    font-weight: bold;

    &:link,
    &:visited {
      color: ${lightModeTextSecondary};
    }
  `;

  let next = pathname || `/${locale}/`;
  sp.set("next", next);

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
    <SignIn href={`${prefix}${FXA_SIGNIN_URL}?${sp.toString()}`} rel="nofollow">
      Already a subscriber?
    </SignIn>
  );
}
