import {
  IEX_DOMAIN,
  PLUS_ENABLED_COUNTRIES,
  PLUS_IS_AVAILABLE_OVERRIDE,
} from "./constants";
import { UserData } from "./user-context";
const HOMEPAGE_RE = /^\/[A-Za-z-]*\/?(?:_homepage)?$/i;
const DOCS_RE = /^\/[A-Za-z-]+\/docs\/.*$/i;
const PLUS_RE = /^\/[A-Za-z-]*\/?plus(?:\/?.*)$/i;
const CATEGORIES = ["html", "javascript", "css", "api", "http"];

export function docCategory({ pathname = "" } = {}): string | null {
  const [, , , webOrLearn, category] = pathname.split("/");
  if (
    webOrLearn?.toLowerCase() === "learn" ||
    webOrLearn?.toLowerCase() === "web"
  ) {
    if (CATEGORIES.includes(category?.toLocaleLowerCase?.())) {
      return `category-${category.toLowerCase()}`;
    }
    return `category-${webOrLearn.toLowerCase()}`;
  }
  if (isHomePage(pathname)) {
    return `category-home`;
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
    iexFrame.contentWindow?.postMessage(
      { theme: theme },
      window?.mdnWorker?.settings?.preferOnline === false
        ? window.location.origin
        : IEX_DOMAIN
    );
  }
}

export function switchTheme(theme: string, set: (theme: string) => void) {
  const body = document.querySelector("body");

  if (window && body) {
    body.className = theme;
    body.style.backgroundColor = "";
    window.localStorage.setItem("theme", theme);
    set(theme);
    postToIEx(theme);
  }
}

export function isPlusAvailable(userData: UserData | null) {
  if (typeof PLUS_IS_AVAILABLE_OVERRIDE === "boolean") {
    return PLUS_IS_AVAILABLE_OVERRIDE;
  }
  if (!userData) {
    return false;
  }
  return PLUS_ENABLED_COUNTRIES.includes(userData?.geo?.country);
}
