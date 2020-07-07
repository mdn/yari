import * as React from "react";

export default function SignInLink({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const LOCATION = window.location.pathname;

  return (
    <a
      href={`/${locale}/users/account/signup-landing?next=${LOCATION}`}
      rel="nofollow"
      className={className ? className : undefined}
      onClick={(event) => {
        //open auth modal
      }}
    >
      Sign in
    </a>
  );
}
