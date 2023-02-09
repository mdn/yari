import { NoteBanner } from "../note-banner";

function getUrlByLocale(locale: string): string {
  switch (locale) {
    case "de":
    case "pl":
      return "https://github.com/orgs/mdn/discussions/147";

    default:
      return "https://hacks.mozilla.org/2021/03/mdn-localization-in-march-tier-1-locales-unfrozen-and-future-plans/";
  }
}

export function RetiredLocaleNote({ locale }: { locale: string }) {
  const url = getUrlByLocale(locale);

  return (
    <NoteBanner
      linkText={
        "The page you requested has been retired, so we've sent you to the English equivalent."
      }
      url={url}
      type={"neutral"}
    />
  );
}
