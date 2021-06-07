import React from "react";
import { useLocation, useParams } from "react-router-dom";
import useSWR from "swr";

import { Doc } from "../document/types";
import LANGUAGES_RAW from "../languages.json";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

// TODO IDEA
// Use https://www.npmjs.com/package/string-similarity
// to download the /$locale/search-index.json to get a list of all possible
// URLs and see if we can compare the current URL with one of those
// for making a great suggestion,
// like "Did you mean: <a href=$url>$doctitle</a>?"

export default function FallbackLink({ url }: { url: string }) {
  const { locale } = useParams();
  const location = useLocation();

  const [fallbackCheckURL, setFallbackCheckURL] =
    React.useState<null | string>(null);

  const { error, data: document } = useSWR<null | Doc>(
    fallbackCheckURL,
    async (url) => {
      const response = await fetch(url);
      if (response.ok) {
        const { doc } = await response.json();
        return doc;
      } else if (response.status === 404) {
        return null;
      }
      throw new Error(`${response.status} on ${url}`);
    },
    { revalidateOnFocus: false }
  );

  React.useEffect(() => {
    if (url && url.includes("/docs/") && locale.toLowerCase() !== "en-us") {
      // What if we attempt to see if it would be something there in English?
      // We'll use the `index.json` version of the URL
      let enUSURL = url.replace(`/${locale}/`, "/en-US/");
      // But of the benefit of local development, devs can use `/_404/`
      // instead of `/docs/` to simulate getting to the Page not found page.
      // So remove that when constructing the English index.json URL.
      enUSURL = enUSURL.replace("/_404/", "/docs/");

      // Lastly, because we're going to append `index.json` always make sure
      // the URL, up to this point, has a trailing /. The "defensiveness" here
      // is probably only necessary so it works in production and in local development.
      if (!enUSURL.endsWith("/")) {
        enUSURL += "/";
      }
      enUSURL += "index.json";
      setFallbackCheckURL(enUSURL);
    }
  }, [url, locale, location]);

  if (error) {
    return (
      <div className="fallback-document notecard negative">
        <h4>Oh no!</h4>
        <p>
          Unfortunately, when trying to look to see if there was an English
          fallback, that check failed. This is either because of a temporary
          network error or because of a bug.
        </p>
        <p>
          The error was: <code>{error.toString()}</code>
        </p>
      </div>
    );
  } else if (document) {
    return (
      <div className="fallback-document notecard success">
        <h4>Good news!</h4>
        <p>
          The page you requested doesn't exist in{" "}
          <b>{LANGUAGES.get(locale.toLowerCase())?.English}</b> but it exists in{" "}
          <b>English</b>
        </p>
        <p className="fallback-link">
          <a href={document.mdn_url}>
            <b>{document.title}</b>
            <br />
            <small>{document.mdn_url}</small>
          </a>
        </p>
      </div>
    );
  } else if (document === null) {
    // It means the lookup "worked" in principle, but there wasn't an English
    // document there. Bummer. But at least we tried.
    // Should we say something??
  }

  return null;
}
