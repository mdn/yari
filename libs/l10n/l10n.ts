import { Locale } from "../types/core.js";

type LocaleStringMap = Record<Locale, string>;

function localeString(strings: LocaleStringMap) {
  return (locale: string) => strings[locale] ?? strings["en-US"];
}

export const ONLY_AVAILABLE_IN_ENGLISH = localeString({
  de: "Diese Seite ist derzeit nur auf Englisch verfügbar",
  "en-US": "This page is currently only available in English",
  es: "Esta página está disponible solo en inglés",
  fr: "Cette page est actuellement disponible uniquement en anglais",
  ja: "このページは現在、英語のみで利用可能です。",
  ko: "이 페이지는 현재 영어로만 제공됩니다",
  "pt-BR": "Esta página está disponível apenas em inglês no momento",
  ru: "В настоящее время эта страница доступна только на английском языке",
  "zh-CN": "此页面目前仅提供英文版本",
  "zh-TW": "此頁面目前僅提供英文版本",
});
