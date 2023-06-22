import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useIsServer, useLocale } from "../hooks";
import { Doc } from "../../../libs/types/document";
import {
  EditorContent,
  initPlayIframe,
  SESSION_KEY,
} from "../playground/utils";

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
  while (prev.parentElement?.firstElementChild) {
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

function addBreakoutButton(
  element: Element | null,
  id: string,
  code: EditorContent,
  locale: string
) {
  if (!element || element.querySelector(".play-button")) return;
  const button = document.createElement("button");

  button.textContent = "Play";

  button.setAttribute("class", "play-button external");
  button.type = "button";
  button.setAttribute("data-play", id);
  button.title = "Open in Playground";
  element.appendChild(button);

  button.addEventListener("click", (e) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(code));
    const url = new URL(window?.location.href);
    url.pathname = `/${locale}/play`;
    url.hash = "";
    url.search = "";
    window.location.href = url.href;
  });
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
      code[part] += src;
    }
  }
  return nodes.length ? { code, nodes } : null;
}

function getLanguage(node: Element): string | null {
  for (const part of LIVE_SAMPLE_PARTS) {
    if (node.classList.contains(part)) {
      return part;
    }
  }
  return null;
}

function getCodeAndNodesForIframeBySampleClass(cls: string, src: string) {
  const code: EditorContent = {
    css: "",
    html: "",
    js: "",
    src,
  };

  let empty = true;
  const nodes: Element[] = [];
  document.querySelectorAll(`pre.live-sample___${cls}`).forEach((pre) => {
    let lang = getLanguage(pre);
    if (lang === null) {
      return;
    }
    empty = false;
    nodes.push(pre);
    code[lang] += pre.textContent;
  });
  return empty ? null : { code, nodes };
}

function getCodeAndNodesForIframe(id: string, iframe: Element, src: string) {
  let heading = document.getElementById(id) || closestHeading(iframe);
  if (!heading) {
    return null;
  }
  let r = codeForHeading(heading, src);
  while (r === null) {
    heading = prevHeading(heading);
    if (heading === null) {
      return null;
    }
    r = codeForHeading(heading, src);
  }
  return r;
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

    document
      .querySelectorAll("div.code-example pre:not(.hidden)")
      .forEach((element) => {
        const header = element.parentElement?.querySelector(".example-header");
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
      });
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
