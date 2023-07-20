import { AuthContainer } from "../../ui/molecules/auth-container";
import "./login-banner.scss";
import { usePlusUrl } from "../utils";
import { PLUS_UPDATES } from "../../telemetry/constants";
import { useGleanClick } from "../../telemetry/glean-context";

export function LoginBanner() {
  const href = usePlusUrl();
  const gleanClick = useGleanClick();

  return (
    <div className="login-banner">
      <span>
        <span>Want to use filters?</span>{" "}
        <strong>
          Log in to{" "}
          <a
            className="plus-link"
            href={href}
            onClick={() => gleanClick(`${PLUS_UPDATES.MDN_PLUS}: banner-link`)}
          >
            MDN Plus
          </a>
          .
        </strong>
      </span>
      <AuthContainer
        logInGleanContext={`${PLUS_UPDATES.MDN_PLUS}: banner-login`}
        signUpGleanContext={`${PLUS_UPDATES.MDN_PLUS}: banner-signup`}
      />
    </div>
  );
}
