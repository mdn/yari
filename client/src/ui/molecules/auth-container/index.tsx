// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/signin-link'. Did ... Remove this comment to see the full error message
import SignInLink from "../../atoms/signin-link";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/subscribe-link'. D... Remove this comment to see the full error message
import { SubscribeLink } from "../../atoms/subscribe-link";

import "./index.scss";

export const AuthContainer = () => {
  return (
    <ul className="auth-container">
      <li>
        <SignInLink />
      </li>
      <li>
        <SubscribeLink />
      </li>
    </ul>
  );
};
