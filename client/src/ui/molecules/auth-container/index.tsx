import SignInLink from "../../atoms/signin-link";
import { SubscribeLink } from "../../atoms/subscribe-link";

import "./index.scss";

export const AuthContainer = ({ gleanContext }) => {
  return (
    <ul className="auth-container">
      <li>
        <SignInLink />
      </li>
      <li>
        <SubscribeLink gleanContext={gleanContext} />
      </li>
    </ul>
  );
};
