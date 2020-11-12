import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "./index.scss";

// NOTE! To hack on this component, you have to use a trick to even get to this
// unless you use the Express server on localhost:5000.
// To get here, use http://localhost:3000/en-US/_404/Whatever/you/like
// Now hot-reloading works and you can iterate faster.
// Otherwise, you can use http://localhost:5000/en-US/docs/Whatever/you/like
// (note the :5000 port) and that'll test it a bit more realistically.

export function NoMatch() {
  const location = useLocation();
  const [url, setURL] = useState("");

  useEffect(() => {
    // If we're in a useEffect, this means we're in a client-side rendering
    // and in that case the current window.location is realistic.
    // When it's server-side rendered, the URL is "fake" just to generate
    // the "empty template" page.
    setURL(location.pathname);
  }, [location]);

  // TODO IDEA
  // Use https://www.npmjs.com/package/string-similarity
  // to download the /$locale/search-index.json to get a list of all possible
  // URLs and see if we can compare the current URL with one of those
  // for making a great suggestion,
  // like "Did you mean: <a href=$url>$doctitle</a>?"
  // All of this should be done in a lazy-loaded module.

  return (
    <div className="no-match">
      <main className="page-content-container" role="main">
        {/* This string should match the `pageTitle` set in ssr/render.js */}
        <h1>Page not found</h1>
        {url && (
          <p className="sorry-message">
            Sorry, the page <code>{url}</code> could not be found.
          </p>
        )}
        <p>
          <a href="/">Go back to the home page</a>
        </p>
      </main>
    </div>
  );
}
