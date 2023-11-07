import { AI_HELP } from "../../telemetry/constants";
import { SignUpLink } from "../../ui/atoms/signup-link";
import { PlusLoginBanner } from "../common/login-banner";

export function AiLoginBanner() {
  return (
    <PlusLoginBanner gleanPrefix={AI_HELP}>
      Want to use AI Help?
    </PlusLoginBanner>
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
