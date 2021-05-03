/* eslint-disable node/no-missing-require */
const { resolveFundamental } = require("@yari-internal/fundamental-redirects");
const { getLocale } = require("@yari-internal/get-locale");
const {
  decodePath,
  encodePath,
  slugToFolder,
} = require("@yari-internal/slug-utils");
const { VALID_LOCALES } = require("@yari-internal/constants");

const THIRTY_DAYS = 3600 * 24 * 30;
const NEEDS_LOCALE = /^\/(?:docs|search|settings|signin|signup)(?:$|\/)/;
// Note that the keys of "VALID_LOCALES" are lowercase locales.
const LOCALE_URI_WITHOUT_TRAILING_SLASH = new Set(
  [...VALID_LOCALES.keys()].map((locale) => `/${locale}`)
);
const LOCALE_URI_WITH_TRAILING_SLASH = new Set(
  [...VALID_LOCALES.keys()].map((locale) => `/${locale}/`)
);
// TODO: The code that uses LEGACY_URI_NEEDING_TRAILING_SLASH should be
//       temporary. For example, when we have moved to the Yari-built
//       account settings page, we should add fundamental redirects
//       for "/{locale}/account/?" and "/account/?" that redirect to
//       "/{locale}/settings" and "/settings" respectively. The other
//       cases can be either redirected or deleted eventually as well.
//       The goal is to eventually remove the code that uses
//       LEGACY_URI_NEEDING_TRAILING_SLASH.
const LEGACY_URI_NEEDING_TRAILING_SLASH = new RegExp(
  `^(?:${[...LOCALE_URI_WITHOUT_TRAILING_SLASH].join(
    "|"
  )})?/(?:account|contribute|maintenance-mode|payments)/?$`
);

const CONTENT_DEVELOPMENT_DOMAIN = ".content.dev.mdn.mozit.cloud";

function redirect(location, { status = 302, cacheControlSeconds = 0 } = {}) {
  /*
   * Create and return a redirect response.
   */
  let statusDescription;
  let cacheControlValue;
  if (status === 301) {
    statusDescription = "Moved Permanently";
  } else {
    statusDescription = "Found";
  }
  if (cacheControlSeconds) {
    cacheControlValue = `max-age=${cacheControlSeconds},public`;
  } else {
    cacheControlValue = "no-store";
  }
  // We need to URL encode the pathname, but leave the query string as is.
  // Suppose the old URL was `/search?q=text%2Dshadow` and all we need to do
  // is to inject the locale to that URL, we should not URL encode the whole
  // new URL otherwise you'd end up with `/en-US/search?q=text%252Dshadow`
  // since the already encoded `%2D` would become `%252D` which is wrong and
  // different.
  const [pathname, querystring] = location.split("?", 2);
  let newLocation = encodeURI(pathname);
  if (querystring) {
    newLocation += `?${querystring}`;
  }
  return {
    status,
    statusDescription,
    headers: {
      location: [
        {
          key: "Location",
          value: newLocation,
        },
      ],
      "cache-control": [
        {
          key: "Cache-Control",
          value: cacheControlValue,
        },
      ],
    },
  };
}

exports.handler = async (event) => {
  /*
   * Modify the request before it's passed to the S3 origin.
   */
  const request = event.Records[0].cf.request;
  const requestURILowerCase = request.uri.toLowerCase();
  const host = request.headers.host[0].value.toLowerCase();
  const qs = request.querystring ? `?${request.querystring}` : "";

  // If the URL was something like `https://domain/en-US/search/`, our code
  // would make a that a redirect to `/en-US/search` (stripping the trailing slash).
  // But if it was `https://domain//en-US/search/` it *would* make a redirect
  // to `//en-US/search`.
  // However, if pathname starts with `//` the Location header might look
  // relative but it's actually an absolute URL.
  // A 302 redirect from `https://domain//evil.com/` actually ends open
  // opening `https://evil.com/` in the browser, because the browser will
  // treat `//evil.com/ == https://evil.com/`.
  // Prevent any pathnames that start with a double //.
  // This essentially means that a request for `GET /////anything` becomes
  // 302 with `Location: /anything`.
  if (request.uri.startsWith("//")) {
    return redirect(`/${request.uri.replace(/^\/+/g, "")}`);
  }

  let { url, status } = resolveFundamental(request.uri);
  if (url) {
    // NOTE: The query string is not forwarded for document requests,
    //       as directed by their origin request policy, so it's safe to
    //       assume "request.querystring" is empty for document requests.
    if (request.querystring) {
      url += (url.includes("?") ? "&" : "?") + request.querystring;
    }
    return redirect(url, {
      status,
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

  // Do we need to insert the locale? If we do, trim a trailing slash
  // to avoid a double redirect, except when requesting the home page.
  if (
    request.uri === "" ||
    request.uri === "/" ||
    NEEDS_LOCALE.test(requestURILowerCase)
  ) {
    const path = request.uri.endsWith("/")
      ? request.uri.slice(0, -1)
      : request.uri;
    // Note that "getLocale" only returns valid locales, never a retired locale.
    const locale = getLocale(request);
    // The only time we actually want a trailing slash is when the URL is just
    // the locale. E.g. `/en-US/` (not `/en-US`)
    return redirect(`/${locale}${path || "/"}` + qs);
  }

  // At this point, the URI is guaranteed to start with a forward slash.
  const uriParts = request.uri.split("/");
  const uriFirstPart = uriParts[1];
  const uriFirstPartLC = uriFirstPart.toLowerCase();

  // Do we need to redirect to the properly-cased locale? We also ensure
  // here that requests for the home page have a trailing slash, while
  // all others do not.
  if (
    VALID_LOCALES.has(uriFirstPartLC) &&
    uriFirstPart !== VALID_LOCALES.get(uriFirstPartLC)
  ) {
    // Assemble the rest of the path without a trailing slash.
    const extra = uriParts.slice(2).filter(Boolean).join("/");
    return redirect(`/${VALID_LOCALES.get(uriFirstPartLC)}/${extra}${qs}`);
  }

  // Handle cases related to the presence or absence of a trailing-slash.
  if (LOCALE_URI_WITHOUT_TRAILING_SLASH.has(requestURILowerCase)) {
    // Home page requests are the special case on MDN. They should
    // always have a trailing slash. So a home page URL without a
    // trailing slash should redirect to the same URL with a
    // trailing slash. When the redirected home-page request is
    // processed by this Lambda function, note that we'll remove
    // the trailing slash before the request reaches S3 (see below).
    return redirect(request.uri + "/" + qs, {
      cacheControlSeconds: THIRTY_DAYS,
    });
  } else if (LOCALE_URI_WITH_TRAILING_SLASH.has(requestURILowerCase)) {
    // We've received a proper request for a locale's home page (i.e.,
    // it has a traling slash), but since that request will be served
    // from S3, we need to strip the trailing slash before it reaches
    // S3. This is required because we store the home pages in S3 as
    // their path name itself, for example "en-us" for the English home
    // page, not "en-us/index.html", which is what S3 would look for if
    // we left the trailing slash.
    request.uri = request.uri.slice(0, -1);
  } else if (
    request.uri.endsWith("/") &&
    !LEGACY_URI_NEEDING_TRAILING_SLASH.test(requestURILowerCase)
  ) {
    // All other requests with a trailing slash should redirect to the
    // same URL without the trailing slash.
    return redirect(request.uri.slice(0, -1) + qs, {
      cacheControlSeconds: THIRTY_DAYS,
    });
  }

  // This condition exists to accommodate AWS origin-groups, which
  // include two origins, the primary and the secondary, where the
  // secondary origin is only attempted if the primary fails. Since
  // origin groups introduce multiple origins for the same CloudFront
  // behavior, we have to ensure we only make adjustments for custom
  // S3 origins.
  if (
    request.origin.custom &&
    request.origin.custom.domainName.includes("s3")
  ) {
    // Rewrite the URI to match the keys in S3.
    // NOTE: The incoming URI should remain URI-encoded. However, it
    // must be passed to slugToFolder as decoded version to lowercase
    // non-ascii symbols and sanitize symbols like ":".
    request.uri = encodePath(slugToFolder(decodePath(request.uri)));
    // Rewrite the HOST header to match the S3 bucket website domain.
    // This is required only because we're using S3 as a website, which
    // we need in order to do redirects from S3. NOTE: The origin is
    // considered a "custom" origin because we're using S3 as a website.
    request.headers.host[0].value = request.origin.custom.domainName;
    // Conditionally rewrite the path (prefix) of the origin.
    if (host.endsWith(CONTENT_DEVELOPMENT_DOMAIN)) {
      // When reviewing PR's, each PR gets its own subdomain, and
      // all of its content is prefixed with that subdomain in S3.
      request.origin.custom.path = `/${host.split(".")[0]}`;
    } else {
      request.origin.custom.path = "/main";
    }
  }
  return request;
};
