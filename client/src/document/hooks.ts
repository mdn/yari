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
  highlight,
} from "./code/playground";
import { addCopyToClipboardButton } from "./code/copy";
import { useUIStatus } from "../ui-context";
import { highlightSyntax } from "./highlight";

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
  const { highlightedQueueExample } = useUIStatus();

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
        highlight(header, highlightedQueueExample);
      });
  }, [doc, isServer, locale, highlightedQueueExample]);
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

export function useDecorateExamples(doc: Doc | undefined) {
  const location = useLocation();

  useEffect(() => {
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
        highlightSyntax(
          element,
          header?.querySelector(".language-name")?.textContent || "plain"
        );
      });
  }, [doc, location]);
}

/**
 * Provides the height of the sticky header.
 */
export function useStickyHeaderHeight() {
  const [height, setHeight] = useState<number>(0);

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const header = document.getElementsByClassName(
      "sticky-header-container"
    )?.[0];
    if (!header) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        if (timeout.current) {
          window.clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          setHeight(height);
          timeout.current = null;
        }, 250);
      }
    });

    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
  }, [setHeight]);

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
