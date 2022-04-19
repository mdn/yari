import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Doc, FrequentlyViewedEntry } from "./types";

export function useDocumentURL() {
  const { "*": slug, locale } = useParams();
  const url = `/${locale}/docs/${slug}`;
  // If you're in local development Express will force the trailing /
  // on any URL. We can't keep that if we're going to compare the current
  // pathname with the document's mdn_url.
  return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
}

export function useCopyExamplesToClipboard(doc: Doc | undefined) {
  useEffect(() => {
    if (!doc) {
      return;
    }
    if (!navigator.clipboard) {
      console.log(
        "Copy-to-clipboard disabled because your browser does not appear to support it."
      );
      return;
    }

    [...document.querySelectorAll("div.code-example pre:not(.hidden)")].forEach(
      (element) => {
        const wrapper = element.parentElement;
        // No idea how a parentElement could be falsy in practice, but it can
        // in theory and hence in TypeScript. So to having to test for it, bail
        // early if we have to.
        if (!wrapper) return;

        const button = document.createElement("button");
        const span = document.createElement("span");
        const liveregion = document.createElement("span");

        span.textContent = "Copy to Clipboard";

        button.setAttribute("type", "button");
        button.setAttribute("class", "icon copy-icon");
        span.setAttribute("class", "visually-hidden");
        liveregion.classList.add("copy-icon-message", "visually-hidden");
        liveregion.setAttribute("role", "alert");
        liveregion.style.top = "52px";

        button.appendChild(span);
        wrapper.appendChild(button);
        wrapper.appendChild(liveregion);

        button.onclick = async () => {
          let copiedSuccessfully = true;
          try {
            const text = element.textContent || "";
            await navigator.clipboard.writeText(text);
          } catch (err) {
            console.error(
              "Error when trying to use navigator.clipboard.writeText()",
              err
            );
            copiedSuccessfully = false;
          }

          if (copiedSuccessfully) {
            button.classList.add("copied");
            showCopiedMessage(wrapper, "Copied!");
          } else {
            button.classList.add("failed");
            showCopiedMessage(wrapper, "Error trying to copy to clipboard!");
          }

          setTimeout(
            () => {
              hideCopiedMessage(wrapper);
            },
            copiedSuccessfully ? 1000 : 3000
          );
        };
      }
    );
  }, [doc]);
}

function showCopiedMessage(wrapper: HTMLElement, msg: string) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = msg;
  element.classList.remove("visually-hidden");
}

function hideCopiedMessage(wrapper: HTMLElement) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = ""; // ensure contents change, so that they are picked up by the live region
  if (element) {
    element.classList.add("visually-hidden");
  }
}

function getCopiedMessageElement(wrapper: HTMLElement) {
  const className = "copy-icon-message";
  let element: HTMLSpanElement | null = wrapper.querySelector(
    `span.${className}`
  );
  if (!element) {
    element = document.createElement("span");
    element.classList.add(className);
    element.classList.add("visually-hidden");
    element.setAttribute("role", "alert");
    element.style.top = "52px";
    wrapper.appendChild(element);
  }
  return element;
}

const FREQUENTLY_VIEWED_STORAGE_KEY = "frequently-viewed-documents";
const FREQUENTLY_VIEWED_MAX_ITEMS = 20;

const sortByVisitsThenTimestampDesc = (
  first: FrequentlyViewedEntry,
  second: FrequentlyViewedEntry
) => {
  if (first.visitCount > second.visitCount) return -1;
  if (first.visitCount < second.visitCount) return 1;
  if (first.timestamp < second.timestamp) return 1;
  if (first.timestamp > second.timestamp) return -1;
  return 0;
};

export function useFrequentlyViewed(): [
  FrequentlyViewedEntry[],
  (arg: FrequentlyViewedEntry[]) => void
] {
  const [entries, setEntries] = useState<FrequentlyViewedEntry[]>([]);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const entries = JSON.parse(
      localStorage.getItem(FREQUENTLY_VIEWED_STORAGE_KEY) || "[]"
    ) as FrequentlyViewedEntry[];
    const newEntries: FrequentlyViewedEntry[] = [];
    for (const entry of entries) {
      newEntries.push({
        url: entry.url,
        title: entry.title,
        timestamp: entry.timestamp,
        parents: entry?.parents || [],
        visitCount: entry.visitCount,
      });
    }
    //Reset sorting in case of undelete
    setEntries(newEntries.sort(sortByVisitsThenTimestampDesc));
    setUpdated(false);
  }, [updated]);

  const setStoredEntries = (value: FrequentlyViewedEntry[]) => {
    try {
      setEntries(entries);
      window.localStorage.setItem(
        FREQUENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify(value.slice(0, FREQUENTLY_VIEWED_MAX_ITEMS))
      );
      setUpdated(true);
    } catch (err) {
      console.error(`Failed to write to localStorage: ${err}`);
    }
  };

  return [entries, setStoredEntries];
}

/**
 * @param  {Doc|undefined} doc
 * Persists frequently viewed docs to localstorage as part of MDN Plus MVP.
 *
 */
export function usePersistFrequentlyViewed(doc: Doc | undefined) {
  useEffect(() => {
    if (!doc) {
      return;
    }
    let frequentlyViewed = JSON.parse(
      localStorage.getItem(FREQUENTLY_VIEWED_STORAGE_KEY) || "[]"
    );

    const newEntry: FrequentlyViewedEntry = {
      url: doc.mdn_url,
      title: doc.title,
      parents: doc.parents,
      timestamp: new Date().getTime(),
      visitCount: 1,
    };

    if (frequentlyViewed.length === 0) {
      localStorage.setItem(
        FREQUENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify([newEntry])
      );
      return;
    }

    const index = frequentlyViewed.findIndex(
      (entry) => entry.url === newEntry.url
    );

    if (index !== -1) {
      frequentlyViewed[index].timestamp = new Date().getTime();
      frequentlyViewed[index].visitCount += 1;
    } else {
      frequentlyViewed.unshift(newEntry);
    }

    //Sort descending so most frequently viewed appears on top.
    frequentlyViewed = frequentlyViewed.sort(sortByVisitsThenTimestampDesc);
    try {
      localStorage.setItem(
        FREQUENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify(frequentlyViewed.slice(0, FREQUENTLY_VIEWED_MAX_ITEMS))
      );
    } catch (err) {
      console.error(`Failed to write to localStorage: ${err}`);
    }
  });
}

/**
 * Provides the height of the sticky header.
 */
export function useStickyHeaderHeight() {
  function determineStickyHeaderHeight(): number {
    if (typeof getComputedStyle !== "function") {
      // SSR.
      return 0;
    }

    const styles = getComputedStyle(document.documentElement);
    const stickyHeaderHeight = styles
      .getPropertyValue("--sticky-header-height")
      .trim();

    if (stickyHeaderHeight.endsWith("rem")) {
      const fontSize = styles.fontSize.trim();
      if (fontSize.endsWith("px")) {
        return parseFloat(stickyHeaderHeight) * parseFloat(fontSize);
      } else {
        console.warn(
          `[useStickyHeaderHeight] fontSize has unexpected unit: ${fontSize}`
        );
        return 0;
      }
    } else if (stickyHeaderHeight.endsWith("px")) {
      return parseFloat(stickyHeaderHeight);
    } else {
      console.warn(
        `[useStickyHeaderHeight] --sticky-header-height has unexpected unit: ${stickyHeaderHeight}`
      );
      return 0;
    }
  }

  const [height, setHeight] = useState<number>(determineStickyHeaderHeight());

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Unfortunately we cannot observe the CSS variable using MutationObserver,
    // but we know that it may change when the width of the window changes.

    const debouncedListener = () => {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        setHeight(determineStickyHeaderHeight());
        timeout.current = null;
      }, 250);
    };

    window.addEventListener("resize", debouncedListener);

    return () => window.removeEventListener("resize", debouncedListener);
  }, []);

  return height;
}

/**
 * Observes elements and fires the callback when the first visible element changes.
 */
export function useFirstVisibleElement(
  observedElementsProvider: () => Element[],
  visibleElementCallback: (firstVisibleElement: Element | null) => void
) {
  const [firstVisibleElement, setFirstVisibleElement] =
    useState<Element | null>(null);

  useEffect(() => {
    visibleElementCallback(firstVisibleElement);
  }, [visibleElementCallback, firstVisibleElement]);

  const [rootMargin, setRootMargin] = useState<string>("");
  const stickyHeaderHeight = useStickyHeaderHeight();

  useEffect(() => {
    setRootMargin(`-${stickyHeaderHeight}px 0px 0px 0px`);
  }, [stickyHeaderHeight]);

  useEffect(() => {
    const observedElements = observedElementsProvider();
    const visibilityByElement = new Map<Element, boolean>();

    function manageVisibility(entries: IntersectionObserverEntry[]) {
      for (const entry of entries) {
        visibilityByElement.set(entry.target, entry.isIntersecting);
      }
    }

    function manageFirstVisibleElement() {
      const visibleElements = Array.from(visibilityByElement.entries())
        .filter(([, value]) => value)
        .map(([key]) => key);

      setFirstVisibleElement(visibleElements[0] ?? null);
    }

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        manageVisibility(entries);
        manageFirstVisibleElement();
      },
      {
        rootMargin,
        threshold: [0.0, 1.0],
      }
    );

    observedElements.forEach((element) => {
      visibilityByElement.set(element, false);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [rootMargin, observedElementsProvider, visibleElementCallback]);
}
