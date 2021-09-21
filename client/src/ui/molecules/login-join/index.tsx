import SignInLink from "../../atoms/signin-link";
import SubscribeLink from "../../atoms/subscribe-link";

export default function LoginJoin() {
  return (
    <>
      <li>
        <SignInLink />
      </li>
      <li>
        <SubscribeLink />
      </li>
    </>
  );
}
