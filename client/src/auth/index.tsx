import React from "react";

import { PageContentContainer } from "../ui/atoms/page-content";

const SignInApp = React.lazy(() => import("./sign-in"));
const SignUpApp = React.lazy(() => import("./sign-up"));

function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  const isServer = typeof window === "undefined";
  const pageTitle = "Sign in to MDN Web Docs";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);
  return (
    <PageContentContainer extraClasses={`auth-page-container ${className}`}>
      {/* The reason for displaying this <h1> here (and for SignUp too)
          is to avoid an unnecessary "flicker".
          component here is loaded SSR and is immediately present.
          Only the "guts" below is lazy loaded. By having the header already
          present the page feels less flickery at a very affordable cost of
          allowing this to be part of the main JS bundle.
       */}
      <h1 className="slab-highlight">{pageTitle}</h1>
      {!isServer && children}
    </PageContentContainer>
  );
}
export function SignIn() {
  return (
    <Container className="sign-in">
      <React.Suspense fallback={<p>Loading...</p>}>
        <SignInApp />
      </React.Suspense>
    </Container>
  );
}
export function SignUp() {
  return (
    <Container className="sign-up">
      <React.Suspense fallback={<p>Loading...</p>}>
        <SignUpApp />
      </React.Suspense>
    </Container>
  );
}
