import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

import { VALID_LOCALES } from "./constants";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    debug: true,

    fallbackLng: "en-US",
    supportedLngs: Array.from(VALID_LOCALES).map((l) => l[1]),

    interpolation: {
      prefix: "[[",
      suffix: "]]",
      escapeValue: false, // not needed for react as it escapes by default
    },

    react: {
      useSuspense: false,
    },

    backend: {
      loadPath: "/[[lng]]/_yari/[[ns]].json",
    },
  });

export default i18n;
