import { styled } from "linaria/react";

import LoginJoin from "../login-join";
import UserMenu from "../user-menu";

import { useUserData } from "../../../user-context";

import { DISABLE_AUTH } from "../../../constants";
import { mqLargeDesktopAndUp, mqTabletAndUp } from "../../vars/js/variables";

export default function HeaderAuthContainer() {
  const userData = useUserData();

  // For example, if you're using Yari purely for previewing your content edits,
  // it might not make sense to do any auth.
  if (DISABLE_AUTH) {
    return null;
  }

  // if we don't have the user data yet, don't render anything
  if (!userData || typeof window === "undefined") {
    return null;
  }

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

  const component = !(userData.isAuthenticated && userData.username) ? (
    <AuthContainer className="auth-container">
      <LoginJoin />
    </AuthContainer>
  ) : (
    <UserMenu />
  );

  return component;
}
