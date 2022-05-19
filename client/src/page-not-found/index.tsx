// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { useLocation } from "react-router-dom";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../ui/atoms/page-content'. Did... Remove this comment to see the full error message
import { PageContentContainer } from "../ui/atoms/page-content";
import "./index.scss";

// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const FallbackLink = React.lazy(() => import("./fallback-link"));

// NOTE! To hack on this component, you have to use a trick to even get to this
// unless you use the Express server on localhost:5042.
// To get here, use http://localhost:3000/en-US/_404/Whatever/you/like
// Now hot-reloading works and you can iterate faster.
// Otherwise, you can use http://localhost:5042/en-US/docs/Whatever/you/like
// (note the :5042 port) and that'll test it a bit more realistically.

export function PageNotFound() {
  const location = useLocation();
  const [url, setURL] = React.useState("");

  React.useEffect(() => {
    // If we're in a useEffect, this means we're in a client-side rendering
    // and in that case the current window.location is realistic.
    // When it's server-side rendered, the URL is "fake" just to generate
    // the "empty template" page.
    setURL(location.pathname);
  }, [location]);

  return (
    <div className="main-wrapper page-not-found">
      <PageContentContainer>
        <article className="main-page-content">
          {/* This string should match the `pageTitle` set in ssr/render.js */}
          <h1>Page not found</h1>

          {url && (
            <p className="sorry-message">
              Sorry, the page <code>{url}</code> could not be found.
            </p>
          )}

          {url && (
            <React.Suspense fallback={null}>
              <FallbackLink url={url} />
            </React.Suspense>
          )}

          <p>
            <a href="/">Go back to the home page</a>
          </p>
        </article>
      </PageContentContainer>
    </div>
  );
}
