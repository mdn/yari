function isKumaURL(pathname) {
  const KUMA_PATH_ROOTS = ["users", "profiles"];
  const [, root1, root2] = pathname.split("/");
  return KUMA_PATH_ROOTS.includes(root1) || KUMA_PATH_ROOTS.includes(root2);
}

function toKumaURL(url: URL) {
  const newURL = new URL(url.toString());
  newURL.host = process.env.REACT_APP_KUMA_HOST || "";
  return newURL.toString();
}

function redirectKumaURLs() {
  if (isKumaURL(window.location.pathname)) {
    window.location.href = toKumaURL(new URL(window.location.href));
  }
}

/**
 * Redirects URLs that should be handled within kuma for now.
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
      form.action = toKumaURL(new URL(form.action));
      form.submit();
    });
  }
}
