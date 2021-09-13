import { styled } from "linaria/react";

import Login from "../login";
import SubscribeLink from "../../atoms/subscribe-link";

import { mqLargeDesktopAndUp, mqTabletAndUp } from "../../vars/js/variables";

export default function HeaderAuthContainer() {
  const AuthContainer = styled.ul`
    margin-top: 48px;

    @media ${mqTabletAndUp} {
      align-items: center;
      display: flex;
      gap: 12px;
    }

    @media ${mqLargeDesktopAndUp} {
      margin-top: 0;
    }
  `;

  return (
    <AuthContainer className="auth-container">
      <li>
        <Login />
      </li>
      <li>
        <SubscribeLink />
      </li>
    </AuthContainer>
  );
}
