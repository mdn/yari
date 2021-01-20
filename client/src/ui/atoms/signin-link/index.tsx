import { useLocale } from "../../../hooks";
import { getAuthURL } from "../../../utils/auth-link";

export default function SignInLink({ className }: { className?: string }) {
  const locale = useLocale();
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
