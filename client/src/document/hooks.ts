import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useIsServer, useLocale } from "../hooks";
import { Doc } from "../../../libs/types/document";
import { initPlayIframe } from "../playground/utils";
// import { addExplainButton } from "./code/ai-explain";
import {
  addBreakoutButton,
  addCollectButton,
  getCodeAndNodesForIframe,
  getCodeAndNodesForIframeBySampleClass,
} from "./code/playground";
import { addCopyToClipboardButton } from "./code/copy";

export function useDocumentURL() {
  const locale = useLocale();
  const { "*": slug } = useParams();
  const url = `/${locale}/docs/${slug}`;
  // If you're in local development Express will force the trailing /
  // on any URL. We can't keep that if we're going to compare the current
  // pathname with the document's mdn_url.
  return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
}

export function useCollectSample(doc: any) {
  const isServer = useIsServer();
  const locale = useLocale();

  useEffect(() => {
    if (isServer) {
      return;
    }

    if (!doc) {
      return;
    }
    document
      .querySelectorAll(
        "section > *:not(#syntax) ~ * .example-header:not(.play-sample)"
      )
      .forEach((header) => {
        addCollectButton(header, "collect", locale);
      });
  }, [doc, isServer, locale]);
}

export function useRunSample(doc: Doc | undefined) {
  const isServer = useIsServer();
  const locale = useLocale();

  useEffect(() => {
    if (isServer) {
      return;
    }

    if (!doc) {
      return;
    }
    document.querySelectorAll("iframe").forEach((iframe) => {
      const src = new URL(iframe.src || "", "https://example.com");
      if (!(src && src.pathname.toLowerCase().endsWith(`/runner.html`))) {
        return null;
      }
      const id = src.searchParams.get("id");
      if (!id) {
        return null;
      }

      const r =
        getCodeAndNodesForIframeBySampleClass(id, src.pathname) ||
        getCodeAndNodesForIframe(id, iframe, src.pathname);
      if (r === null) {
        return null;
      }
      const { code, nodes } = r;
      nodes.forEach((element) => {
        if (element.classList.contains("hidden")) {
          return;
        }
        const header =
          element.parentElement?.querySelector(".example-header") || null;
        addBreakoutButton(header, id, code, locale);
      });
      addBreakoutButton(
        iframe.parentElement?.querySelector(".example-header") || null,
        id,
        code,
        locale
      );
      initPlayIframe(iframe, code);
    });
  }, [doc, isServer, locale]);
}
export function useCopyExamplesToClipboardAndAIExplain(doc: Doc | undefined) {
  const location = useLocation();
  const isServer = useIsServer();

  useEffect(() => {
    if (isServer) {
      return;
    }

    if (!doc) {
      return;
    }

    document
      .querySelectorAll("div.code-example pre:not(.hidden)")
      .forEach((element) => {
        const header = element.parentElement?.querySelector(".example-header");
        // Paused for now
        // addExplainButton(header, element);
        if (!navigator.clipboard) {
          console.log(
            "Copy-to-clipboard disabled because your browser does not appear to support it."
          );
          return;
        } else {
          addCopyToClipboardButton(element, header);
        }
      });
  }, [doc, location, isServer]);
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
    const sidebar = document.querySelector(".sidebar-container");

    if (sidebar) {
      return parseFloat(getComputedStyle(sidebar).top);
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

  const [rootMargin, setRootMargin] = useState<string>("0px");
  const stickyHeaderHeight = useStickyHeaderHeight();

  useEffect(() => {
    setRootMargin(`-${stickyHeaderHeight}px 0px 0px 0px`);
  }, [stickyHeaderHeight]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      // SSR or old browser.
      return;
    }

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
