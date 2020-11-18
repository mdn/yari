import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import useSWR from "swr";

import LANGUAGES_RAW from "../languages.json";
import { Doc } from "../document/types";
import { PageContentContainer } from "../ui/atoms/page-content";
import "./index.scss";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);
console.log(LANGUAGES);

// NOTE! To hack on this component, you have to use a trick to even get to this
// unless you use the Express server on localhost:5000.
// To get here, use http://localhost:3000/en-US/_404/Whatever/you/like
// Now hot-reloading works and you can iterate faster.
// Otherwise, you can use http://localhost:5000/en-US/docs/Whatever/you/like
// (note the :5000 port) and that'll test it a bit more realistically.

export function PageNotFound() {
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
    <div className="page-not-found">
      <PageContentContainer>
        {/* This string should match the `pageTitle` set in ssr/render.js */}
        <h1>Page not found</h1>

        {url && (
          <p className="sorry-message">
            Sorry, the page <code>{url}</code> could not be found.
          </p>
        )}

        {url && <FallbackLink url={url} />}

        <p>
          <a href="/">Go back to the home page</a>
        </p>
      </PageContentContainer>
    </div>
  );
}

function FallbackLink({ url }: { url: string }) {
  const { locale } = useParams();
  const location = useLocation();
  // useSWR();
  // const fallbackCheckURL = `/en-US/` + location
  const [fallbackCheckURL, setFallbackCheckURL] = useState<null | string>(null);

  const { error, data: document } = useSWR<null | Doc>(
    fallbackCheckURL,
    async (url) => {
      const response = await fetch(url);
      if (response.ok) {
        const { doc } = await response.json();
        return doc;
      }
      return null;
    },
    { revalidateOnFocus: false }
  );
  useEffect(() => {
    if (url && locale.toLowerCase() !== "en-us") {
      // What if we attempt to see if it would be something there in English?
      console.log("KNOW", { locale, url, location });
      // We'll use the `index.json` version of the URL
      let enUSURL = url.replace(`/${locale}/`, "/en-US/");
      // But of the benefit of local development, devs can use `/_404/`
      // instead of `/docs/` to simulate getting to the Page not found page.
      // So remove that when constructing the English index.json URL.
      enUSURL = enUSURL.replace("/_404/", "/docs/");

      if (!enUSURL.endsWith("/")) {
        enUSURL += "/";
      }
      enUSURL += "index.json";
      setFallbackCheckURL(enUSURL);
    }
  }, [url, locale, location]);

  console.log({ error, document });

  if (document) {
    console.log(LANGUAGES);

    console.log({ locale });

    return (
      <div className="fallback-document">
        <p>
          <b>Good news!</b> The page you requested doesn't exist in{" "}
          <b>{LANGUAGES.get(locale.toLowerCase())?.English}</b> but it exists in{" "}
          <b>English</b>
        </p>
        <p>
          <Link to={document.mdn_url}>
            <b>{document.title}</b>
          </Link>
          <br />
          <Link to={document.mdn_url}>
            <small>{document.mdn_url}</small>
          </Link>
        </p>
      </div>
    );
  }

  return null;
}
