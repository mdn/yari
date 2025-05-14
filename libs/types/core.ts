export type Locale =
  | "de"
  | "en-US"
  | "es"
  | "fr"
  | "it"
  | "ja"
  | "ko"
  | "pt-BR"
  | "ru"
  | "zh-CN"
  | "zh-TW";
export type TranslatedLocale = Exclude<Locale, "en-US">;
