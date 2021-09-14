import { useLocation } from "react-router-dom";
import { styled } from "linaria/react";

import { useLocale } from "../../../hooks";
import { FXA_SIGNIN_URL } from "../../../constants";
import { lightModeTextSecondary } from "../../vars/js/variables";

export default function SignInLink() {
  const locale = useLocale();
  const { pathname } = useLocation();
  const SignIn = styled.a`
    font-weight: bold;

    &:link,
    &:visited {
      color: ${lightModeTextSecondary};
    }
  `;

  let next = pathname || `/${locale}/`;

  return (
    <SignIn href={`${FXA_SIGNIN_URL}?next=${next}`} rel="nofollow">
      Already a subscriber?
    </SignIn>
  );
}
