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
      <AuthContainer
        signInGleanContext={`ai-help: upsell-login`}
        subscribeGleanContext={`ai-help: upsell-button`}
      />
    </div>
  );
}
