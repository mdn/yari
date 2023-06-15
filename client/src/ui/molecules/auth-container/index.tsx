import { useUserData } from "../../../user-context";
import SignInLink from "../../atoms/signin-link";
import { SubscribeLink } from "../../atoms/subscribe-link";

import "./index.scss";

export const AuthContainer = ({
  signInGleanContext,
  subscribeGleanContext,
}) => {
  const user = useUserData();
  const isAuthenticated = user?.isAuthenticated ?? false;

  return (
    <ul className="auth-container">
      {!isAuthenticated && (
        <li>
          <SignInLink gleanContext={signInGleanContext} />
        </li>
      )}
      <li>
        <SubscribeLink
          gleanContext={subscribeGleanContext}
          toPlans={isAuthenticated}
        />
      </li>
    </ul>
  );
};
