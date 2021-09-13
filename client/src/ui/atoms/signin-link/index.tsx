import { styled } from "linaria/react";

import { FXA_SIGNIN_URL } from "../../../constants";
import { lightModeTextSecondary } from "../../vars/js/variables";

export default function SignInLink() {
  const SignIn = styled.a`
    font-weight: bold;

    &:link,
    &:visited {
      color: ${lightModeTextSecondary};
    }
  `;
  return (
    <SignIn href={FXA_SIGNIN_URL} rel="nofollow">
      Already a subscriber?
    </SignIn>
  );
}
