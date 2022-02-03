const HOMEPAGE_RE = /^\/[A-Za-z\-]*\/?(?:_homepage)?$/i;
const DOCS_RE = /^\/[A-Za-z\-]+\/docs\/.*$/i;
const PLUS_RE = /^\/[A-Za-z\-]*\/?plus(?:\/?.*)$/i;

export function docCategory({ pathname = "" } = {}): string | null {
  const [, , , webOrLearn, category] = pathname.split("/");
  if ((webOrLearn === "Learn" || webOrLearn === "Web") && category) {
    return `category-${category.toLowerCase()}`;
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
