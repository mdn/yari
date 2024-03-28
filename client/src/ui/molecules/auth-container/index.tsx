import LogInLink from "../../atoms/login-link";
import { SignUpLink } from "../../atoms/signup-link";

import "./index.scss";

export const AuthContainer = ({ logInGleanContext, signUpGleanContext }) => {
  return (
    <ul className="auth-container mobile-hidden">
      <li>
        <LogInLink gleanContext={logInGleanContext} />
      </li>
      <li>
        <SignUpLink gleanContext={signUpGleanContext} />
      </li>
    </ul>
  );
};
