import React from "react";

import { PageContentContainer } from "../ui/atoms/page-content";

const SignInApp = React.lazy(() => import("./sign-in"));
const SignUpApp = React.lazy(() => import("./sign-up"));

function Container({
  pageTitle,
  children,
  className,
}: {
  pageTitle: string;
  children: React.ReactNode;
  className: string;
}) {
  const isServer = typeof window === "undefined";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  return (
    <div className={className}>
      <PageContentContainer>
        {isServer ? (
          <p>
            <i>Requires JavaScript</i>
          </p>
        ) : (
          children
        )}
      </PageContentContainer>
    </div>
  );
}
export function SignIn() {
  return (
    <Container className="sign-in" pageTitle="Sign in">
      <React.Suspense fallback={<p>Loading...</p>}>
        <SignInApp />
      </React.Suspense>
    </Container>
  );
}
export function SignUp() {
  return (
    <Container className="sign-up" pageTitle="Sign up">
      <React.Suspense fallback={<p>Loading...</p>}>
        <SignUpApp />
      </React.Suspense>
    </Container>
  );
}
