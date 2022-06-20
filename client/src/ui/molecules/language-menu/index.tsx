import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useGA } from "../../../ga-context";
import {
  LOCALE_OVERRIDE_HASH,
  getPreferredCookieLocale,
  setPreferredCookieLocale,
} from "../../../preferred-locale";
import { Translation } from "../../../document/types";
import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

export function LanguageMenu({
  onClose,
  translations,
  native,
}: {
  onClose: () => void;
  translations: Translation[];
  native: string;
}) {
  const menuId = "language-menu";
  const ga = useGA();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const { locale = "en-US" } = useParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
      // to the URL you're already on, we're doing this extra check.
      if (newPathname !== pathname) {
        navigate(newPathname);
      }
    }
  }, [locale, hash, pathname, navigate, translations]);

  function changeLocale(event) {
    event.preventDefault();

    const preferredLocale = event.currentTarget.name;
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

      setIsOpen(false);
      onClose();
    }
  }

  const menuEntry = {
    label: "Languages",
    id: menuId,
    items: translations.map((translation) => ({
      component: () => (
        <LanguageMenuItem
          native={native}
          translation={translation}
          changeLocale={changeLocale}
        />
      ),
    })),
  };

  return (
    <DropdownMenuWrapper
      className="languages-switcher-menu open-on-focus-within"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Button
        id="languages-switcher-button"
        type="action"
        ariaHasPopup={"menu"}
        ariaExpanded={isOpen || undefined}
        icon="language"
        size="small"
        extraClasses="languages-switcher-menu"
        onClickHandler={() => setIsOpen(!isOpen)}
      >
        {native}
      </Button>

      <DropdownMenu>
        <Submenu menuEntry={menuEntry} />
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
}

function LanguageMenuItem({ translation, changeLocale, native }) {
  return (
    <button
      aria-current={translation.native === native || undefined}
      key={translation.locale}
      name={translation.locale}
      onClick={changeLocale}
      className="button submenu-item"
    >
      <span>{translation.native}</span>
    </button>
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
