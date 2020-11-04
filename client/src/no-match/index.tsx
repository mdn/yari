import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Titlebar } from "../ui/molecules/titlebar";

import "./index.scss";

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

  return (
    <div className="no-match">
      <div className="page-content-container">
        <main className="main-content" role="main">
          {/* This string should match the `pageTitle` set in ssr/render.js */}
          <Titlebar docTitle="Page Not Found" />
          {url && (
            <p className="sorry-message">
              Sorry, the page <code>{url}</code> you requested doesn't appear to
              live here anymore.
            </p>
          )}
          <p>
            <a href="/">Go back to the home page</a>
          </p>
        </main>
      </div>
    </div>
  );
}
