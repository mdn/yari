import { IEX_DOMAIN } from "./env";
import { Theme } from "./types/theme";

const HOMEPAGE_RE = /^\/[A-Za-z-]*\/?(?:_homepage)?$/i;
const DOCS_RE = /^\/[A-Za-z-]+\/docs\/.*$/i;
const PLUS_RE = /^\/[A-Za-z-]*\/?plus(?:\/?.*)$/i;
const CATEGORIES = ["html", "javascript", "css", "api", "http"];

export function getCategoryByPathname(pathname = ""): string | null {
  const [, , , webOrLearn, category] = pathname.toLowerCase().split("/");
  if (webOrLearn === "learn" || webOrLearn === "web") {
    if (CATEGORIES.includes(category)) {
      return category;
    }
    return webOrLearn;
  }
  if (isHomePage(pathname)) {
    return "home";
  }
  return null;
}

export function isDocs(pathname: string): boolean {
  return Boolean(pathname.match(DOCS_RE));
}

export function isPlus(pathname: string): boolean {
  return Boolean(pathname.match(PLUS_RE));
}

export function isHomePage(pathname: string): boolean {
  return Boolean(pathname.match(HOMEPAGE_RE));
}

/**
 * Posts the name of the theme we are changing to the
 * interactive examples `iframe`.
 * @param { Theme } theme - The theme to switch to
 */
export function postToIEx(theme: Theme) {
  const iexFrame = document.querySelector(".interactive") as HTMLIFrameElement;

  if (iexFrame) {
    if (iexFrame.getAttribute("data-readystate") === "complete") {
      const origin =
        window?.mdnWorker?.settings?.preferOnline === false
          ? window.location.origin
          : IEX_DOMAIN;
      iexFrame.contentWindow?.postMessage({ theme: theme }, origin);
    }
  }
}

export function switchTheme(theme: Theme, set: (theme: Theme) => void) {
  const html = document.documentElement;

  if (window && html) {
    html.className = theme;
    html.style.backgroundColor = "";
    try {
      window.localStorage.setItem("theme", theme);
    } catch (err) {
      console.warn("Unable to write theme to localStorage", err);
    }
    set(theme);
    postToIEx(theme);
  }
}

export function isPlusSubscriber(user) {
  if (
    user?.isSubscriber &&
    user?.subscriptionType &&
    user?.subscriptionType.includes("plus")
  ) {
    return true;
  }

  return false;
}

/**
 * Makes camelCase strings wrap nicely
 */
export function camelWrap(text: string) {
  return text.replace(/([^A-Z])([A-Z])/g, "$1\u200B$2");
}

export function camelUnwrap(text: string) {
  return text.replace(/[\u200B]/g, "");
}

/**
 * Gets the number of characters in a string.
 * String.length returns the number of code units.
 */
export function charLength(string: string) {
  return [...string].length;
}

/**
 * Slices by characters in a string.
 * String.slice slices by code units.
 */
export function charSlice(string: string, start?: number, end?: number) {
  return [...string].slice(start, end).join("");
}

export function range(start: number, stop: number) {
  return [...Array(Math.max(stop - start, 0)).keys()].map((n) => n + start);
}

function getBaseFontSize(): number {
  // This is the default that applies to most users.
  return 16;
}

export function getLineDistance(
  a: HTMLElement | null,
  b: HTMLElement | null
): number {
  if (!a || !b) {
    return -1;
  }

  const { top: aTop, bottom: aBottom } = a.getBoundingClientRect();
  const { top: bTop, bottom: bBottom } = b.getBoundingClientRect();

  const px = aTop < bTop ? bBottom - aTop : aBottom - bTop;
  const rem = px / getBaseFontSize();

  return Math.round(rem);
}

function getTreePath(
  element: HTMLElement,
  { boundary, selector }: { boundary: HTMLElement; selector: string }
): HTMLElement[] {
  const path: HTMLElement[] = [];

  let current: HTMLElement | null = element;
  while (current && boundary.contains(current)) {
    path.push(current);
    current = (current.parentNode as HTMLElement)?.closest(selector);
  }

  return path.reverse();
}

function getPathDistance<T>(a: T[], b: T[]): number {
  while (a.length && b.length && a[0] === b[0]) {
    // Remove common ancestors.
    a.shift();
    b.shift();
  }

  // Remove one edge.
  a.pop() || b.pop();

  return a.length + b.length;
}

export function getTreeDistance(
  a: HTMLElement | null,
  b: HTMLElement | null,
  { boundary, selector }: { boundary: HTMLElement; selector: string }
): number {
  if (!a || !b) {
    return -1;
  }
  if (a === b) {
    return 0;
  }

  const aPath = getTreePath(a, { boundary, selector });
  const bPath = getTreePath(b, { boundary, selector });

  return getPathDistance(aPath, bPath);
}

function getSlugPath(slug: string): string[] {
  return slug.split("/");
}

export function getSlugDistance(a: string | null, b: string | null) {
  if (!a || !b) {
    return -1;
  } else if (a === b) {
    return 0;
  }

  const aPath = getSlugPath(a);
  const bPath = getSlugPath(b);

  return getPathDistance(aPath, bPath);
}

export function isElementInViewport(el: HTMLElement) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
