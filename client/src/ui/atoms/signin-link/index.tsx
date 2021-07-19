import { Link, useLocation } from "react-router-dom";

import { useLocale } from "../../../hooks";

export default function SignInLink({ className }: { className?: string }) {
  const locale = useLocale();
  const { pathname } = useLocation();
  const sp = new URLSearchParams();
  // If pathname === '/en-US/sigin', i.e. you're already on the sign in page
  // itself, then discard that as a 'next' parameter.
  // Otherwise, you might get redirected back to the sign in page after you've
  // successfully signed in.
  sp.set("next", pathname === `/${locale}/signin` ? `/${locale}/` : pathname);

  return (
    <Link
      to={`/${locale}/signin?${sp.toString()}`}
      rel="nofollow"
      className={className ? className : undefined}
    >
      Sign in
    </Link>
  );
}
