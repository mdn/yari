import React, { lazy, Suspense, useState } from "react";

import { useLocale } from "../../../hooks";
import { getAuthURL } from "../../../utils/auth-link";

const AuthModal = lazy(() => import("../../organisms/auth-modal"));

export default function SignInLink({ className }: { className?: string }) {
  const locale = useLocale();
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
    <>
      <a
        href={getAuthURL(`/${locale}/users/account/signup-landing`)}
        rel="nofollow"
        className={className ? className : undefined}
        onClick={(event) => {
          event.preventDefault();
          setShowAuthModal(true);
        }}
      >
        Sign in
      </a>
      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal onRequestClose={() => setShowAuthModal(false)} />
        </Suspense>
      )}
    </>
  );
}
