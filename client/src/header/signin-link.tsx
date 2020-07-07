import React, { lazy, Suspense, useState } from "react";

import { useLocale } from "./hooks";

const AuthModal = lazy(() => import("./auth-modal"));

export default function SignInLink({ className }: { className?: string }) {
  const locale = useLocale();
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
    <>
      <a
        href={`/${locale}/users/account/signup-landing?next=${window.location.pathname}`}
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
