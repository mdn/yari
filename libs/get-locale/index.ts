// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parse'.
const { parse } = require("cookie");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'acceptLang... Remove this comment to see the full error message
const acceptLanguageParser = require("accept-language-parser");

const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DEFAULT_LO... Remove this comment to see the full error message
  DEFAULT_LOCALE,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
  VALID_LOCALES,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'PREFERRED_... Remove this comment to see the full error message
  PREFERRED_LOCALE_COOKIE_NAME,
} = require("../constants");
const VALID_LOCALES_LIST = [...VALID_LOCALES.values()];

// From https://github.com/aws-samples/cloudfront-authorization-at-edge/blob/01c1bc843d478977005bde86f5834ce76c479eec/src/lambda-edge/shared/shared.ts#L216
// but rewritten in JavaScript (from TypeScript).
function extractCookiesFromHeaders(headers) {
  // Cookies are present in the HTTP header "Cookie" that may be present multiple times.
  // This utility function parses occurrences  of that header and splits out all the cookies and their values
  // A simple object is returned that allows easy access by cookie name: e.g. cookies["nonce"]
  if (!headers["cookie"]) {
    return {};
  }
  const cookies = headers["cookie"].reduce(
    (reduced, header) => Object.assign(reduced, parse(header.value)),
    {}
  );

  return cookies;
}

function getCookie(headers, cookieKey) {
  return extractCookiesFromHeaders(headers)[cookieKey];
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getLocale'... Remove this comment to see the full error message
function getLocale(request, fallback = DEFAULT_LOCALE) {
  // First try by cookie.
  const cookieLocale = getCookie(request.headers, PREFERRED_LOCALE_COOKIE_NAME);
  if (cookieLocale) {
    // If it's valid, stick to it.
    if (VALID_LOCALES.has(cookieLocale.toLowerCase())) {
      return VALID_LOCALES.get(cookieLocale.toLowerCase());
    }
  }

  // Each header in request.headers is always a list of objects.
  const acceptLangHeaders = request.headers["accept-language"];
  const { value = null } = (acceptLangHeaders && acceptLangHeaders[0]) || {};
  const locale =
    value &&
    acceptLanguageParser.pick(VALID_LOCALES_LIST, value, { loose: true });
  return locale || fallback;
}

module.exports = {
  getLocale,
};
