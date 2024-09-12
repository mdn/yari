import { IEX_DOMAIN } from "./env";
import { Theme } from "./types/theme";
import { User } from "./user-context";

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

    setTimeout(() => {
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
      );
      const color = getComputedStyle(document.body).backgroundColor;
      if (meta && color) {
        meta.content = color;
      }
    }, 1);

    try {
      window.localStorage.setItem("theme", theme);
    } catch (err) {
      console.warn("Unable to write theme to localStorage", err);
    }
    set(theme);
    postToIEx(theme);
  }
}

export function isPlusSubscriber(user): user is User {
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

/**
 * Used by quicksearch and sidebar filters.
 */
export function splitQuery(term: string): string[] {
  term = term.trim().toLowerCase();

  if (term.startsWith(".") || term.endsWith(".")) {
    // Dot is probably meaningful.
    return term.split(/[ ,]+/);
  } else {
    // Dot is probably just a word separator.
    return term.split(/[ ,.]+/);
  }
}

export function getCookieValue(name: string) {
  let value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (value && value.includes("=")) {
    value = value.split("=")[1];
  }

  return value;
}

export function setCookieValue(
  name: string,
  value: string,
  { maxAge, path = "/" }: { maxAge: number; path?: string }
) {
  const cookieValue = [
    `${name}=${value}`,
    maxAge && `max-age=${maxAge}`,
    `path=${path}`,
    document.location.hostname !== "localhost" && "secure",
  ]
    .filter(Boolean)
    .join(";");

  document.cookie = cookieValue;
}
