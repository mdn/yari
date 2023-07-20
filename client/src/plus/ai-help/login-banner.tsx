import { AI_HELP } from "../../telemetry/constants";
import { useGleanClick } from "../../telemetry/glean-context";
import { SignUpLink } from "../../ui/atoms/signup-link";
import { AuthContainer } from "../../ui/molecules/auth-container";
import { usePlusUrl } from "../utils";
import "./login-banner.scss";

export function AiLoginBanner() {
  const href = usePlusUrl();
  const gleanClick = useGleanClick();

  return (
    <div className="login-banner">
      <span>
        <span>Want to use AI Help?</span>{" "}
        <strong>
          Log in to{" "}
          <a
            className="plus-link"
            href={href}
            onClick={() => gleanClick(`${AI_HELP}: banner-link`)}
          >
            MDN Plus
          </a>
          .
        </strong>
      </span>
      <AuthContainer
        logInGleanContext={`${AI_HELP}: banner-login`}
        signUpGleanContext={`${AI_HELP}: banner-signup`}
      />
    </div>
  );
}

export function AiUpsellBanner({ limit }: { limit: number }) {
  return (
    <div className="login-banner">
      <span>
        <span>You have reached the limit of {limit} questions per day.</span>
        <br />
        <span>
          <strong>Want to ask more?</strong> Upgrade to MDN Plus 5 or MDN
          Supporter 10.
        </span>
      </span>
      <ul className="auth-container">
        <li>
          <SignUpLink
            gleanContext={`${AI_HELP}: upsell-button`}
            toPlans={true}
          />
        </li>
      </ul>
    </div>
  );
}
