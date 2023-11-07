import { useGleanClick } from "../../telemetry/glean-context";
import { AuthContainer } from "../../ui/molecules/auth-container";
import { usePlusUrl } from "../utils";
import "./login-banner.scss";

export function PlusLoginBanner({
  children,
  className = "login-banner",
  gleanPrefix,
}: {
  children: React.ReactNode;
  className?: string;
  gleanPrefix: string;
}) {
  const href = usePlusUrl();
  const gleanClick = useGleanClick();

  return (
    <div className={className}>
      <span>
        <span>{children}</span>{" "}
        <strong>
          Upgrade to{" "}
          <a
            className="plus-link"
            href={href}
            onClick={() => gleanClick(`${gleanPrefix}: banner-link`)}
          >
            MDN Plus
          </a>{" "}
          for free.
        </strong>
      </span>
      <AuthContainer
        logInGleanContext={`${gleanPrefix}: banner-login`}
        signUpGleanContext={`${gleanPrefix}: banner-signup`}
      />
    </div>
  );
}
