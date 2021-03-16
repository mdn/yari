import React from "react";
import { Link, useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";
import { getAuthURL } from "../../../utils/auth-link";

export default function SignInLink({ className }: { className?: string }) {
  const locale = useLocale();
  const { pathname } = useLocation();

  // NOTE! We can remove this if-statement and make it the default once
  // https://github.com/mdn/yari/issues/2449 is resolved and it has been
  // fully tested in Stage.
  if (process.env.REACT_APP_USE_YARI_SIGNIN) {
    return (
      <Link
        to={`/${locale}/signin?next=${pathname}`}
        rel="nofollow"
        className={className ? className : undefined}
      >
        Sign in
      </Link>
    );
  }
  return (
    <>
      <a
        href={getAuthURL(`/${locale}/users/account/signup-landing`)}
        rel="nofollow"
        className={className ? className : undefined}
      >
        Sign in
      </a>
    </>
  );
}
