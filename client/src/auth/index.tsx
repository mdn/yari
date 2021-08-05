import React from "react";

import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";

const SignInApp = React.lazy(() => import("./sign-in"));
const SignOutApp = React.lazy(() => import("./sign-out"));

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
    <PageContentContainer extraClasses={`auth-page-container ${className}`}>
      {/* The reason for displaying this <h1> here
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
    <Container className="sign-in" pageTitle="Sign in to MDN Web Docs">
      <React.Suspense
        fallback={<Loading message="Loading sign in…" minHeight={400} />}
      >
        <SignInApp />
      </React.Suspense>
    </Container>
  );
}

export function SignOut() {
  return (
    <Container className="sign-out" pageTitle="Sign out">
      <React.Suspense
        fallback={<Loading message="Loading sign out…" minHeight={400} />}
      >
        <SignOutApp />
      </React.Suspense>
    </Container>
  );
}
