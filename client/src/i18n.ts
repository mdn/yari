import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    debug: true,

    fallbackLng: "en-US",

    interpolation: {
      prefix: "[[",
      suffix: "]]",
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      loadPath: "/[[lng]]/_yari/[[ns]]",
    },
  });

export default i18n;
