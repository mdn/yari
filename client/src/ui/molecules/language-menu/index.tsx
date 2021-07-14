import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGA } from "../../../ga-context";
import {
  LOCALE_OVERRIDE_HASH,
  getPreferredCookieLocale,
  setPreferredCookieLocale,
} from "../../../preferred-locale";
import { Translation } from "../../../document/types";

import "./index.scss";

export function LanguageMenu({
  locale,
  translations,
  native,
}: {
  locale: string;
  translations: Translation[];
  native: string;
}) {
  const ga = useGA();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const [preferredLocale, setPreferredLocale] = React.useState(locale);

  // This effect makes you automatically navigate to the locale your cookie
  // prefers if the current page's locale isn't what you prefer and the
  // locale you prefer is one of the valid translations.
  React.useEffect(() => {
    const cookieLocale = getPreferredCookieLocale(document);
    if (
      locale &&
      cookieLocale &&
      locale.toLowerCase() !== cookieLocale.toLowerCase() &&
      // If the URL is something like `#localeOverride` we omit this
      // automatic "redirect" because the user has most likely clicked
      // a link that means that want to "peek" at a locale that is
      // different from what their cookie prefers.
      !hash.toLowerCase().includes(LOCALE_OVERRIDE_HASH.toLowerCase()) &&
      translations
        .map((t) => t.locale.toLowerCase())
        .includes(cookieLocale.toLowerCase())
    ) {
      const newPathname = translateURL(pathname, locale, cookieLocale);
      // Just to be absolutely paranoidly certain it's not going to redirect
      // to the URL you're already don, we're doing this extra check.
      if (newPathname !== pathname) {
        navigate(newPathname);
      }
    }
  }, [locale, hash, pathname, navigate, translations]);

  return (
    <form
      className="language-menu"
      onSubmit={(event) => {
        event.preventDefault();
        // The default is the current locale itself. If that's what's chosen,
        // don't bother redirecting.
        if (preferredLocale !== locale) {
          const localeURL = translateURL(pathname, locale, preferredLocale);
          const cookieValueBefore = getPreferredCookieLocale(document);

          for (const translation of translations) {
            if (translation.locale === preferredLocale) {
              setPreferredCookieLocale(document, translation.locale);
            }
          }

          ga("send", {
            hitType: "event",
            eventCategory: "Language",
            eventAction: `Change preferred language (cookie before: ${
              cookieValueBefore || "none"
            })`,
            eventLabel: `${window.location.pathname} to ${localeURL}`,
          });

          navigate(localeURL);
          window.scrollTo(0, 0);
        }
      }}
    >
      <fieldset id="select-language">
        <legend>Change your language</legend>
        <label htmlFor="language-selector" className="visually-hidden">
          Select your preferred language
        </label>{" "}
        <select
          id="language-selector"
          name="language"
          value={preferredLocale}
          onChange={(event) => {
            const { value } = event.target;
            setPreferredLocale(value);
          }}
        >
          {/*
          This option is alway there and always first.
          The reason it doesn't have the `disabled` attribute is because it
          might not render when viewing the select un-opened and instead what
          you see is the second option.
          The onChange callback is a protection for doing nothing if the
          already current locale is chosen.
         */}
          <option value={locale}>{native}</option>
          {translations.map((t) => {
            return (
              <option key={t.locale} value={t.locale}>
                {t.native}
              </option>
            );
          })}
        </select>{" "}
        <button type="submit" className="button minimal">
          Change language
        </button>
      </fieldset>
    </form>
  );
}

function translateURL(
  pathname: string,
  locale: string,
  destinationLocale: string
) {
  return pathname.replace(
    new RegExp(`^/${locale}/`, "i"),
    `/${destinationLocale}/`
  );
}
