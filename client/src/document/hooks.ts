import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useIsServer, useLocale } from "../hooks";
import { Doc } from "../../../libs/types/document";
import { EditorContent, initPlayIframe } from "../playground/utils";

const LIVE_SAMPLE_PARTS = ["html", "css", "js"];

export function useDocumentURL() {
  const locale = useLocale();
  const { "*": slug } = useParams();
  const url = `/${locale}/docs/${slug}`;
  // If you're in local development Express will force the trailing /
  // on any URL. We can't keep that if we're going to compare the current
  // pathname with the document's mdn_url.
  return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
}

const SECTION_RE = /h[1-6]/i;
function partOfSection(heading: Element, element: Element) {
  if (
    SECTION_RE.test(element.tagName) &&
    element.tagName.toLowerCase() <= heading.tagName.toLowerCase()
  ) {
    return false;
  }
  return true;
}

function sectionForHeading(heading: Element | null): Element[] {
  const nodes: Element[] = [];
  if (heading === null) {
    return [];
  }
  if (!SECTION_RE.test(heading.tagName)) {
    return [...heading.children];
  }
  let next = heading.nextElementSibling;
  while (next && partOfSection(heading, next)) {
    nodes.push(next);
    if (next.nextElementSibling === null) {
      next = next.parentElement?.nextElementSibling?.firstElementChild || null;
    } else {
      next = next.nextElementSibling;
    }
  }
  return nodes;
}

function closestHeading(element: Element) {
  let prev = element;
  while (prev.parentElement && prev.parentElement.firstElementChild) {
    if (SECTION_RE.test(prev.parentElement.firstElementChild.tagName)) {
      return prev.parentElement.firstElementChild;
    }
    prev = prev.parentElement;
  }
  return null;
}

function prevHeading(heading: Element) {
  let prev = heading;
  while (prev.parentElement?.previousElementSibling?.firstElementChild) {
    prev = prev.parentElement.previousElementSibling.firstElementChild;
    if (
      SECTION_RE.test(prev.tagName) &&
      prev.tagName.toLowerCase() <= heading.tagName.toLowerCase()
    ) {
      return prev;
    }
  }
  return null;
}

function codeForHeading(
  heading: Element,
  src: string
): { code: EditorContent; nodes: Element[] } | null {
  const section = sectionForHeading(heading);

  if (!section.length) {
    return null;
  }
  const code: EditorContent = {
    css: "",
    html: "",
    js: "",
    src,
  };

  let empty = true;
  const nodes: Element[] = [];
  for (const part of LIVE_SAMPLE_PARTS) {
    const src = section
      .flatMap((e) => [
        ...e?.querySelectorAll(
          `.${part}, pre[class*="brush:${part}"], pre[class*="${part};"]`
        ),
      ])

      .map((e) => {
        nodes.push(e);
        return e.textContent;
      })
      .join("\n");
    if (src) {
      empty = false;
      code[part] += src;
    }
  }
  return empty ? null : { code, nodes };
}

export function useMakeInteractive(doc: Doc | undefined) {
  const isServer = useIsServer();
  const locale = useLocale();

  useEffect(() => {
    if (isServer) {
      return;
    }

    if (!doc) {
      return;
    }
    [...document.querySelectorAll("iframe")].forEach((iframe) => {
      const src = iframe.src;
      if (!(src && src.toLowerCase().includes(`/unsafe-runner.html`))) {
        return;
      }
      const iframeId = iframe.id;
      const id = iframeId.substring("frame_".length);
      let heading = document.getElementById(id) || closestHeading(iframe);
      if (!heading) {
        return null;
      }
      let r = codeForHeading(heading, iframe.src);
      while (r === null) {
        heading = prevHeading(heading);
        if (heading === null) {
          return null;
        }
        r = codeForHeading(heading, iframe.src);
      }
      const { code, nodes } = r;
      nodes.forEach((element) => {
        const header = element.parentElement?.firstElementChild;
        // No idea how a parentElement could be falsy in practice, but it can
        // in theory and hence in TypeScript. So to having to test for it, bail
        // early if we have to.
        if (!header || header.querySelector(".play-icon")) return;

        const button = document.createElement("button");
        const span = document.createElement("span");

        span.textContent = "Open in Playground";

        button.setAttribute("type", "button");
        button.setAttribute("class", "icon play-icon");
        button.title = "use example in playground";
        span.setAttribute("class", "visually-hidden");
        button.appendChild(span);
        header.appendChild(button);

        button.onclick = async () => {
          const key = `play-${id}-${doc.mdn_url}`;
          sessionStorage.setItem(key, JSON.stringify(code));
          const url = new URL(window?.location.href);
          url.pathname = `/${locale}/play`;
          url.searchParams.set("local", key);
          window.location.href = url.href;
        };
      });
      initPlayIframe(iframe, code);
    });
  }, [doc, isServer, locale]);
}
export function useCopyExamplesToClipboard(doc: Doc | undefined) {
  const location = useLocation();
  const isServer = useIsServer();

  useEffect(() => {
    if (isServer) {
      return;
    }

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
        const header = element.parentElement?.firstElementChild;
        // No idea how a parentElement could be falsy in practice, but it can
        // in theory and hence in TypeScript. So to having to test for it, bail
        // early if we have to.
        if (!header || header.querySelector(".copy-icon")) return;

        const button = document.createElement("button");
        const span = document.createElement("span");
        const liveregion = document.createElement("span");

        span.textContent = "Copy to Clipboard";

        button.setAttribute("type", "button");
        button.setAttribute("class", "icon copy-icon");
        span.setAttribute("class", "visually-hidden");
        liveregion.classList.add("copy-icon-message", "visually-hidden");
        liveregion.setAttribute("role", "alert");

        button.appendChild(span);
        header.appendChild(button);
        header.appendChild(liveregion);

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
            showCopiedMessage(header, "Copied!");
          } else {
            button.classList.add("failed");
            showCopiedMessage(header, "Error trying to copy to clipboard!");
          }

          setTimeout(
            () => {
              hideCopiedMessage(header);
            },
            copiedSuccessfully ? 1000 : 3000
          );
        };
      }
    );
  }, [doc, location, isServer]);
}

function showCopiedMessage(wrapper: Element, msg: string) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = msg;
  element.classList.remove("visually-hidden");
}

function hideCopiedMessage(wrapper: Element) {
  const element = getCopiedMessageElement(wrapper);
  element.textContent = ""; // ensure contents change, so that they are picked up by the live region
  if (element) {
    element.classList.add("visually-hidden");
  }
}

function getCopiedMessageElement(wrapper: Element) {
  const className = "copy-icon-message";
  let element: HTMLSpanElement | null = wrapper.querySelector(
    `span.${className}`
  );
  if (!element) {
    element = document.createElement("span");
    element.classList.add(className);
    element.classList.add("visually-hidden");
    element.setAttribute("role", "alert");
    wrapper.appendChild(element);
  }
  return element;
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
