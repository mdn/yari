import { useState } from "react";
import { useLocation } from "react-router-dom";

import { useGleanClick } from "../../../../telemetry/glean-context";
import { Translation } from "../../../../../../libs/types/document";
import { Button } from "../../../atoms/button";
import { Submenu } from "../../../molecules/submenu";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../../../molecules/dropdown";
import { useLocale } from "../../../../hooks";
import { LANGUAGE } from "../../../../telemetry/constants";

// This needs to match what's set in 'libs/constants.js' on the server/builder!
const PREFERRED_LOCALE_COOKIE_NAME = "preferredlocale";

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
  const gleanClick = useGleanClick();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const changeLocale: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    const preferredLocale = event.currentTarget.dataset.locale;
    // The default is the current locale itself. If that's what's chosen,
    // don't bother redirecting.
    if (preferredLocale !== locale) {
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

      const oldValue = cookieValueBefore || "none";
      gleanClick(`${LANGUAGE}: ${oldValue} -> ${preferredLocale}`);
    }
  };

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
        aria-haspopup={"menu"}
        aria-expanded={isOpen || undefined}
        icon="language"
        size="small"
        extraClasses="languages-switcher-menu"
        onClickHandler={() => setIsOpen(!isOpen)}
      >
        {native}
      </Button>

      <DropdownMenu alwaysRenderChildren>
        <Submenu menuEntry={menuEntry} />
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
}

function LanguageMenuItem({
  translation,
  changeLocale,
  native,
}: {
  translation: Translation;
  changeLocale: React.MouseEventHandler<HTMLAnchorElement>;
  native: string;
}) {
  const { pathname } = useLocation();
  const locale = useLocale();

  return (
    <a
      aria-current={translation.native === native || undefined}
      key={translation.locale}
      data-locale={translation.locale}
      onClick={changeLocale}
      href={pathname.replace(`/${locale}/`, `/${translation.locale}/`)}
      className="button submenu-item"
    >
      <span>{translation.native}</span>
    </a>
  );
}
