import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import useSWR from "swr";

import "./index.scss";

import { Loading } from "../ui/atoms/loading";
import { MainContentContainer } from "../ui/atoms/page-content";

import { TranslationDifferences } from "./differences";
import { MissingTranslations } from "./missing";
import { TranslationDashboard } from "./dashboard";
import { useLocale } from "../hooks";

interface Locale {
  locale: string;
  language: {
    English: string;
    native: string;
  };
  isActive: boolean;
  count: number;
}

interface LocalesData {
  locales: Locale[];
}

export default function Translations() {
  return (
    <Container>
      <Routes>
        <Route path="/" element={<PickLocale />} />
        <Route path="differences" element={<TranslationDifferences />} />
        <Route path="missing" element={<MissingTranslations />} />
        <Route path="dashboard" element={<TranslationDashboard />} />
      </Routes>
    </Container>
  );
}

function PickLocale() {
  const locale = useLocale();
  React.useEffect(() => {
    let title = "All translations";
    if (locale.toLowerCase() !== "en-us") {
      title += ` for ${locale}`;
    }
    document.title = title;
  }, [locale]);

  const { data: dataLocales, error: errorLocales } = useSWR<LocalesData, Error>(
    locale.toLowerCase() === "en-us" ? "/_translations/" : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} (${await response.text()})`);
      }
      return response.json();
    }
  );

  if (locale.toLowerCase() === "en-us") {
    return (
      <>
        {!dataLocales && !errorLocales && <Loading />}
        {errorLocales && (
          <div className="error-message">
            <h3>Server error</h3>
            <pre>{errorLocales.toString()}</pre>
          </div>
        )}
        {dataLocales && <ShowLocales locales={dataLocales.locales} />}
      </>
    );
  }

  return (
    <div className="translation-choices">
      <Link to={`/${locale}/_translations/differences`} className="button">
        Translation differences
      </Link>{" "}
      <Link to={`/${locale}/_translations/missing`} className="button">
        Missing translations
      </Link>{" "}
      <Link to={`/${locale}/_translations/dashboard`} className="button">
        Dashboard
      </Link>
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <MainContentContainer className="all-translations" standalone={true}>
      {children}
    </MainContentContainer>
  );
}

function ShowLocales({ locales }: { locales: Locale[] }) {
  return (
    <div>
      <h2>Select locale</h2>
      <table>
        <tbody>
          {locales.map((locale) => {
            return (
              <tr key={locale.locale}>
                <td>
                  <b>
                    {locale.language.English} ({locale.locale})
                  </b>{" "}
                  {!locale.isActive && <small>not active</small>}
                </td>
                <td>{locale.count.toLocaleString()} documents</td>
                <td>
                  <Link to={`/${locale.locale}/_translations/differences`}>
                    Translation differences
                  </Link>{" "}
                </td>
                <td>
                  <Link to={`/${locale.locale}/_translations/missing`}>
                    Missing translations
                  </Link>{" "}
                </td>
                <td>
                  <Link to={`/${locale.locale}/_translations/dashboard`}>
                    Dashboard
                  </Link>{" "}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
