import { parse } from "cookie";
import acceptLanguageParser from "accept-language-parser";

import {
  DEFAULT_LOCALE,
  VALID_LOCALES,
  PREFERRED_LOCALE_COOKIE_NAME,
} from "../constants/index.js";

const VALID_LOCALES_LIST = [...VALID_LOCALES.values()];

// From https://github.com/aws-samples/cloudfront-authorization-at-edge/blob/01c1bc843d478977005bde86f5834ce76c479eec/src/lambda-edge/shared/shared.ts#L216
// but rewritten in JavaScript (from TypeScript).
function extractCookiesFromHeaders(headers) {
  let value = headers["cookie"];

  // Cookies are present in the HTTP header "Cookie" that may be present multiple times.
  // This utility function parses occurrences  of that header and splits out all the cookies and their values
  // A simple object is returned that allows easy access by cookie name: e.g. cookies["nonce"]
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    // Express.
    value = [
      {
        value,
      },
    ];
  }

  const cookies = value.reduce(
    (reduced, header) => Object.assign(reduced, parse(header.value)),
    {}
  );

  return cookies;
}

function getCookie(request, cookieKey) {
  return extractCookiesFromHeaders(request.headers)[cookieKey];
}

function getAcceptLanguage(request) {
  const acceptLangHeaders = request.headers["accept-language"];

  if (typeof acceptLangHeaders === "string") {
    // Express.
    return acceptLangHeaders;
  }

  const { value = null } = (acceptLangHeaders && acceptLangHeaders[0]) || {};
  return value;
}

export function getLocale(request, fallback = DEFAULT_LOCALE) {
  // First try by cookie.
  const cookieLocale = getCookie(request, PREFERRED_LOCALE_COOKIE_NAME);
  if (cookieLocale) {
    // If it's valid, stick to it.
    if (VALID_LOCALES.has(cookieLocale.toLowerCase())) {
      return VALID_LOCALES.get(cookieLocale.toLowerCase());
    }
  }

  // Each header in request.headers is always a list of objects.
  const value = getAcceptLanguage(request);
  const locale =
    value &&
    acceptLanguageParser.pick(VALID_LOCALES_LIST, value, { loose: true });
  return locale || fallback;
}

export function isValidLocale(locale) {
  return typeof locale === "string" && VALID_LOCALES.has(locale.toLowerCase());
}

export function getRepositoryByLocale(locale) {
  switch (locale.toLowerCase()) {
    case "en-us":
      return "content";
    case "de":
      return "translated-content-de";
    default:
      return "translated-content";
  }
}
