import { IEX_DOMAIN } from "./env";

const HOMEPAGE_RE = /^\/[A-Za-z-]*\/?(?:_homepage)?$/i;
const DOCS_RE = /^\/[A-Za-z-]+\/docs\/.*$/i;
const PLUS_RE = /^\/[A-Za-z-]*\/?plus(?:\/?.*)$/i;
const CATEGORIES = ["html", "javascript", "css", "api", "http"];

export function docCategory(pathname = ""): string | null {
  const [, , , webOrLearn, category] = pathname.split("/");
  if (
    webOrLearn?.toLowerCase() === "learn" ||
    webOrLearn?.toLowerCase() === "web"
  ) {
    if (CATEGORIES.includes(category?.toLocaleLowerCase?.())) {
      return category.toLowerCase();
    }
    return webOrLearn.toLowerCase();
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
 * Posts the name of the theme we are changing to to the
 * interactive examples `iframe`.
 * @param { string } theme - The theme to switch to
 */
export function postToIEx(theme: string) {
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

export function switchTheme(theme: string, set: (theme: string) => void) {
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
