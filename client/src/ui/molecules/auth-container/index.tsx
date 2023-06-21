import SignInLink from "../../atoms/signin-link";
import { SubscribeLink } from "../../atoms/subscribe-link";

import "./index.scss";

export const AuthContainer = ({
  signInGleanContext,
  subscribeGleanContext,
}) => {
  return (
    <ul className="auth-container">
      <li>
        <SignInLink gleanContext={signInGleanContext} />
      </li>
      <li>
        <SubscribeLink gleanContext={subscribeGleanContext} />
      </li>
    </ul>
  );
};
