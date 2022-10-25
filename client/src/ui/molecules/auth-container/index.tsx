import SignInLink from "../../atoms/signin-link";
import { SubscribeLink } from "../../atoms/subscribe-link";
import { TOP_NAV_GET_MDN_PLUS } from "../../../telemetry/constants";

import "./index.scss";

export const AuthContainer = () => {
  return (
    <ul className="auth-container">
      <li>
        <SignInLink />
      </li>
      <li>
        <SubscribeLink gleanContext={TOP_NAV_GET_MDN_PLUS} />
      </li>
    </ul>
  );
};
