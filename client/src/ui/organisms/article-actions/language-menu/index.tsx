import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useGleanClick } from "../../../../telemetry/glean-context";
import { Translation } from "../../../../../../libs/types/document";
import { Button } from "../../../atoms/button";
import { Submenu } from "../../../molecules/submenu";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../../../molecules/dropdown";
import { useLocale } from "../../../../hooks";
import { LANGUAGE, LANGUAGE_REMEMBER } from "../../../../telemetry/constants";
import {
  deleteCookie,
  getCookieValue,
  setCookieValue,
} from "../../../../utils";
import { GleanThumbs } from "../../../atoms/thumbs";
import { Switch } from "../../../atoms/switch";

// This needs to match what's set in 'libs/constants.js' on the server/builder!
const PREFERRED_LOCALE_COOKIE_NAME = "preferredlocale";
const PREFERRED_LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 3; // 3 years.

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
    const newLocale = event.currentTarget.dataset.locale;
    // The default is the current locale itself. If that's what's chosen,
    // don't bother redirecting.
    if (newLocale !== locale) {
      const oldLocale = getCookieValue(PREFERRED_LOCALE_COOKIE_NAME);

      if (oldLocale === locale) {
        for (const translation of translations) {
          if (translation.locale === newLocale) {
            setCookieValue(PREFERRED_LOCALE_COOKIE_NAME, newLocale, {
              maxAge: PREFERRED_LOCALE_COOKIE_MAX_AGE,
            });
            gleanClick(`${LANGUAGE_REMEMBER}: ${oldLocale} -> ${newLocale}`);
          }
        }
      }

      gleanClick(`${LANGUAGE}: ${locale} -> ${newLocale}`);
    }
  };

  const menuEntry = {
    label: "Languages",
    id: menuId,
    items: [
      {
        component: () => <LocaleRedirectSetting />,
      },
      ...translations.map((translation) => ({
        component: () => (
          <LanguageMenuItem
            native={native}
            translation={translation}
            changeLocale={changeLocale}
          />
        ),
      })),
    ],
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

function LocaleRedirectSetting() {
  const gleanClick = useGleanClick();
  const locale = useLocale();
  const [preferredLocale, setPreferredLocale] = useState<string | undefined>();

  useEffect(() => {
    setPreferredLocale(getCookieValue(PREFERRED_LOCALE_COOKIE_NAME));
  }, []);

  function toggle(event) {
    const oldValue = getCookieValue(PREFERRED_LOCALE_COOKIE_NAME);
    const newValue = event.target.checked;
    if (newValue) {
      setCookieValue(PREFERRED_LOCALE_COOKIE_NAME, locale, {
        maxAge: 60 * 60 * 24 * 365 * 3,
      });
      setPreferredLocale(locale);
      gleanClick(`${LANGUAGE_REMEMBER}: ${oldValue} -> ${locale}`);
    } else {
      deleteCookie(PREFERRED_LOCALE_COOKIE_NAME);
      setPreferredLocale(undefined);
      gleanClick(`${LANGUAGE_REMEMBER}: ${oldValue} -> 0`);
    }
  }

  return (
    <form className="submenu-item locale-redirect-setting">
      <Switch
        name="locale-redirect"
        checked={locale === preferredLocale}
        toggle={toggle}
      >
        Remember language
      </Switch>
      <GleanThumbs feature="locale-redirect" question="Is this useful?" />
    </form>
  );
}
