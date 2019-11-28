import FlexSearch from "flexsearch";
import React from "react";
import { useLocale } from "../hooks";
import fuzzysearch from "./fuzzy-search";
import "./request-idle-callback-shim";

function useIdleCallback(callback, deps) {
  React.useEffect(() => {
    const id = window.requestIdleCallback(callback);
    return () => {
      window.cancelIdleCallback(id);
    };
  }, [...deps]);
}

async function createIndex(locale) {
  // Always do the XHR network request (hopefully good HTTP caching
  // will make this pleasant for the client) but localStorage is
  // always faster than XHR even with localStorage's flaws.
  const localStorageCacheKey = `${locale}-titles`;
  const storedTitlesRaw = localStorage.getItem(localStorageCacheKey);
  if (storedTitlesRaw) {
    let storedTitles = null;
    try {
      storedTitles = JSON.parse(storedTitlesRaw);
    } catch (ex) {
      console.warn(ex);
    }
    // XXX Could check the value of 'storedTitles._fetchDate'.
    // For example if `new Date().getTime() - storedTitles._fetchDate`
    // is a really small number, it probably just means the page was
    // refreshed very recently.
    if (storedTitles) {
      return indexTitles(storedTitles);
    }
  }

  const response = await fetch(`/${locale}/titles.json`);

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const { titles } = await response.json();

  // So we can keep track of how old the data is when stored
  // in localStorage.
  titles._fetchDate = new Date().getTime();
  try {
    localStorage.setItem(localStorageCacheKey, JSON.stringify(titles));
  } catch (ex) {
    console.warn(
      ex,
      `Unable to store a ${JSON.stringify(titles).length} string`
    );
  }

  return indexTitles(titles);
}

function indexTitles(titles) {
  // NOTE! See search-experimentation.js to play with different settings.
  const flex = new FlexSearch({
    encode: "advanced",
    suggest: true,
    // tokenize: "reverse",
    tokenize: "forward"
  });

  const urisSorted = [];
  Object.entries(titles)
    .sort((a, b) => b[1].popularity - a[1].popularity)
    .forEach(([uri, info]) => {
      // XXX investigate if it's faster to add all at once
      // https://github.com/nextapps-de/flexsearch/#addupdateremove-documents-tofrom-the-index
      flex.add(uri, info.title);
      urisSorted.push(uri);
    });

  return {
    flex: flex.search.bind(flex),
    fuzzy: fuzzysearch.bind(null, urisSorted),
    titles
  };
}

const SearchIndexContext = React.createContext(null);

export function SearchIndexProvider({ children }) {
  const locale = useLocale();
  const [index, setIndex] = React.useState(null);

  async function createAndSetIndex(usedLocale) {
    try {
      const newIndex = await createIndex(usedLocale);
      // locale can change while index is being loaded
      if (usedLocale === locale) {
        setIndex(newIndex);
      }
    } catch (e) {
      setIndex(e);
      console.error(e);
    }
  }

  useIdleCallback(() => {
    createAndSetIndex(locale).catch(e => console.error(e));
  }, [locale]);

  return (
    <SearchIndexContext.Provider value={index}>
      {children}
    </SearchIndexContext.Provider>
  );
}

/**
 * @returns {null | Error | {flex: Function, fuzzy: Function, titles: Object}}
 */
export function useSearch() {
  return React.useContext(SearchIndexContext);
}
