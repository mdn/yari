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
  }, [pageTitle]);
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
      {/* The reason for displaying this <h1> here (and for SignUp too)
          is to avoid an unnecessary "flicker".
          component here is loaded SSR and is immediately present.
          Only the "guts" below is lazy loaded. By having the header already
          present the page feels less flickery at a very affordable cost of
          allowing this to be part of the main JS bundle.
       */}
      <h1>Sign in</h1>
      <React.Suspense fallback={<p>Loading...</p>}>
        <SignInApp />
      </React.Suspense>
    </Container>
  );
}
export function SignUp() {
  return (
    <Container className="sign-up" pageTitle="Sign up">
      <h1>Sign up</h1>
      <React.Suspense fallback={<p>Loading...</p>}>
        <SignUpApp />
      </React.Suspense>
    </Container>
  );
}
