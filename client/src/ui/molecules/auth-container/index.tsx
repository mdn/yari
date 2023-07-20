import SignInLink from "../../atoms/signin-link";
import { SignUpLink } from "../../atoms/signup-link";

import "./index.scss";

export const AuthContainer = ({ logInGleanContext, signUpGleanContext }) => {
  return (
    <ul className="auth-container">
      <li>
        <SignInLink gleanContext={logInGleanContext} />
      </li>
      <li>
        <SignUpLink gleanContext={signUpGleanContext} />
      </li>
    </ul>
  );
};
