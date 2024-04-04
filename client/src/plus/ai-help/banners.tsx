import { useMemo } from "react";
import { AI_HELP } from "../../telemetry/constants";
import { Icon } from "../../ui/atoms/icon";
import { SignUpLink } from "../../ui/atoms/signup-link";
import { useUserData } from "../../user-context";
import { PlusLoginBanner } from "../common/login-banner";
import { isPlusSubscriber } from "../../utils";

export function AiHelpBanner({
  isDisabled = false,
}: { isDisabled?: boolean } = {}) {
  const user = useUserData();

  const isSubscriber = useMemo(() => isPlusSubscriber(user), [user]);

  return (
    <div className={`ai-help-banner ${isDisabled ? "disabled" : ""}`}>
      <p>
        <Icon name="bell-ring" />
        <strong>
          {isSubscriber
            ? "GPT-4-powered AI Help."
            : "Supercharge your AI Help experience with our paid subscriptions."}
        </strong>
      </p>
      <p>
        {isSubscriber
          ? "Now with chat history, enhanced context, and optimized prompts."
          : "Upgrade to MDN Plus 5 or MDN Supporter 10 to unlock the potential of GPT-4-powered AI Help."}
      </p>
      <p>This is a beta feature.</p>
      {!isSubscriber && (
        <SignUpLink gleanContext={`${AI_HELP}: upsell-banner`} toPlans={true} />
      )}
    </div>
  );
}

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
