function isKumaURL(pathname) {
  const KUMA_PATH_ROOTS = ["users", "profiles"];
  const [, root1, root2] = pathname.split("/");
  return KUMA_PATH_ROOTS.includes(root1) || KUMA_PATH_ROOTS.includes(root2);
}

function toKumaURL(pathname) {
  const url = new URL(pathname, "http://" + process.env.REACT_APP_KUMA_HOST);
  url.searchParams.set("DEV_ORIGIN_HOST", window.location.host);
  return url.toString();
}

function redirectKumaURLs() {
  const { pathname } = window.location;
  if (isKumaURL(pathname)) {
    window.location.href = toKumaURL(pathname);
  }
}

/**
 * Redirects URLs that should be handled within kuma for now. It also adds a
 * query parameter named DEV_ORIGIN_HOST which kuma checks for in dev mode
 * to redirect back and set auth cookies for this domain as well.
 */
export function interceptAndRedirectKumaURLs() {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_KUMA_HOST
  ) {
    redirectKumaURLs();
    window.addEventListener("popstate", redirectKumaURLs);

    window.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }
      event.preventDefault();
      form.action = toKumaURL(new URL(form.action).pathname);
      form.submit();
    });
  }
}
