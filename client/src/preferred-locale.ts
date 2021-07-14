// This needs to match what's set in 'libs/constants.js' on the server/builder!
const PREFERRED_LOCALE_COOKIE_NAME = "preferredlocale";

// This is what goes into the URL if the automatic redirect-by-cookie is to
// be blocked. I.e. when someone with a non-en-US cookie wants to view the en-US.
// This variable is set here because it's used by different components.
export const LOCALE_OVERRIDE_HASH = "#localeOverride";

export function getPreferredCookieLocale(document: Document) {
  let value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${PREFERRED_LOCALE_COOKIE_NAME}=`));
  if (value && value.includes("=")) {
    value = value.split("=")[1];
  }
  return value;
}

export function setPreferredCookieLocale(document: Document, value: string) {
  let cookieValue = `${PREFERRED_LOCALE_COOKIE_NAME}=${value};max-age=${
    60 * 60 * 24 * 365 * 3
  };path=/`;
  if (
    !(
      document.location.hostname === "localhost" ||
      document.location.hostname === "localhost.org"
    )
  ) {
    cookieValue += ";secure";
  }
  document.cookie = cookieValue;
}
