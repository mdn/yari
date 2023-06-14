import { useGleanClick } from "../../telemetry/glean-context";
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
          Upgrade to{" "}
          <a
            className="plus-link"
            href={href}
            onClick={() => gleanClick(`ai-help: banner-link`)}
          >
            MDN Plus
          </a>
          .
        </strong>
      </span>
      <AuthContainer
        signInGleanContext={`ai-help: banner-login`}
        subscribeGleanContext={`ai-help: banner-button`}
      />
    </div>
  );
}

export function AiUpsellBanner() {
  const href = usePlusUrl();
  const gleanClick = useGleanClick();

  return (
    <div className="login-banner">
      <span>
        <span>You have reached the limit of 5 questions per day.</span>{" "}
        <span>
          Upgrade to{" "}
          <a
            className="plus-link"
            href={href}
            onClick={() => gleanClick(`ai-help: banner-link`)}
          >
            MDN Plus 5/10
          </a>{" "}
          to continue using AI Help.
        </span>
      </span>
    </div>
  );
}
