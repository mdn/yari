/* eslint-disable node/no-missing-require */
const {
  CSP_VALUE,
  DEFAULT_LOCALE,
  VALID_LOCALES,
} = require("@yari-internal/constants");
const fallbackPaths = new Set(require("./fallback-path.json"));
const { decodePath, slugToFolder } = require("@yari-internal/slug-utils");

const LEGACY_URI_MAY_NEED_REDIRECT = new RegExp(
  `^/(?:${[...VALID_LOCALES.values()]
    .filter((locale) => locale !== DEFAULT_LOCALE.toLowerCase())
    .join("|")})/docs/`
);

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
   * This Lambda@Edge function is designed to handle origin-response
   * events, so for example we can modify the response before it's
   * cached by CloudFront. More specifically, when serving content
   * from S3, only a small set of common headers, like Cache-Control
   * and Content-Type, can be be associated and served with the content.
   * The other headers are added to the response here.
   */
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const uri = request.uri.toLowerCase();

  // Prior to May 2021, we used to host the live samples like this:
  //   /en-US/docs/Web/Foo/_samples_/SampleID/index.html
  // But then, in https://github.com/mdn/yari/pull/3798, we change it to:
  //   /en-US/docs/Web/Foo/_sample_.SampleID.html
  // So to make deployment-timing easier we make this code here work for
  // both the old way and the new way.
  // (Later in 2021 we can remove any mentions of `/_samples_/`)
  const isLiveSampleURI =
    uri.includes("/_samples_/") || uri.includes("/_sample_.");

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
    const decodedUri = decodePath(request.uri);
    if (
      response.status == 404 &&
      LEGACY_URI_MAY_NEED_REDIRECT.test(decodedUri.toLowerCase()) &&
      fallbackPaths.has(
        slugToFolder(decodedUri.replace(LEGACY_URI_MAY_NEED_REDIRECT, ""))
      )
    ) {
      const redirectUri = decodedUri.replace(
        LEGACY_URI_MAY_NEED_REDIRECT,
        `${DEFAULT_LOCALE}/docs/`
      );
      return redirect(redirectUri);
    }
    // The live-sample pages should never respond with an X-Frame-Options
    // header, because they're explicitly created for rendering within an
    // iframe on a different origin.
    if (!isLiveSampleURI) {
      response.headers["x-frame-options"] = [
        { key: "X-Frame-Options", value: "DENY" },
      ];
    }
    response.headers["x-xss-protection"] = [
      { key: "X-XSS-Protection", value: "1; mode=block" },
    ];
    response.headers["x-content-type-options"] = [
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    response.headers["strict-transport-security"] = [
      { key: "Strict-Transport-Security", value: "max-age=63072000" },
    ];
  }

  const contentType = response.headers["content-type"];
  if (
    contentType &&
    contentType[0] &&
    contentType[0].value.startsWith("text/html") &&
    !isLiveSampleURI
  ) {
    response.headers["content-security-policy"] = [
      {
        key: "Content-Security-Policy",
        value: CSP_VALUE,
      },
    ];
  }

  return response;
};
