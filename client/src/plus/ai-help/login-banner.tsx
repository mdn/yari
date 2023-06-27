import { AI_HELP } from "../../telemetry/constants";
import { useGleanClick } from "../../telemetry/glean-context";
import { SubscribeLink } from "../../ui/atoms/subscribe-link";
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
            onClick={() => gleanClick(`${AI_HELP}: banner-link`)}
          >
            MDN Plus
          </a>
          .
        </strong>
      </span>
      <AuthContainer
        signInGleanContext={`${AI_HELP}: banner-login`}
        subscribeGleanContext={`${AI_HELP}: banner-button`}
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
          <SubscribeLink
            gleanContext={`${AI_HELP}: upsell-button`}
            toPlans={true}
          />
        </li>
      </ul>
    </div>
  );
}
