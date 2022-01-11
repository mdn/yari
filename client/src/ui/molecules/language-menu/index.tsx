import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useGA } from "../../../ga-context";
import { Translation } from "../../../document/types";

import { useOnClickOutside } from "../../../hooks";
import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";

import "./index.scss";

// This needs to match what's set in 'libs/constants.js' on the server/builder!
const PREFERRED_LOCALE_COOKIE_NAME = "preferredlocale";

export function LanguageMenu({
  translations,
  native,
}: {
  translations: Translation[];
  native: string;
}) {
  const menuId = "language-menu";
  const ga = useGA();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { locale } = useParams();

  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  const submenuRef = React.useRef(null);
  useOnClickOutside(submenuRef, toggleSubMenu);

  function translateURL(destinationLocale: string) {
    return pathname.replace(`/${locale}/`, `/${destinationLocale}/`);
  }

  function changeLocale(event) {
    event.preventDefault();

    const preferredLocale = event.currentTarget.name;
    // The default is the current locale itself. If that's what's chosen,
    // don't bother redirecting.
    if (preferredLocale !== locale) {
      const localeURL = translateURL(preferredLocale);
      let cookieValueBefore = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${PREFERRED_LOCALE_COOKIE_NAME}=`));
      if (cookieValueBefore && cookieValueBefore.includes("=")) {
        cookieValueBefore = cookieValueBefore.split("=")[1];
      }

      for (const translation of translations) {
        if (translation.locale === preferredLocale) {
          let cookieValue = `${PREFERRED_LOCALE_COOKIE_NAME}=${
            translation.locale
          };max-age=${60 * 60 * 24 * 365 * 3};path=/`;
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
      hideSubMenuIfVisible();
    }
  }

  /**
   * Show and hide submenu
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
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
    <div className="languages-switcher-menu" ref={submenuRef}>
      <Button
        type="action"
        ariaControls={menuId}
        ariaHasPopup={"menu"}
        ariaExpanded={menuId === visibleSubMenuId}
        icon="language"
        extraClasses="languages-switcher-menu"
        onClickHandler={() => {
          toggleSubMenu(menuId);
        }}
      >
        {native}
      </Button>

      <Submenu
        menuEntry={menuEntry}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </div>
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
