import { NoteBanner } from "../note-banner";

export function LocalizedContentNote({
  isActive,
  locale,
}: {
  isActive: boolean;
  locale: string;
}) {
  const activeLocaleNoteContent = {
    "en-US": {
      linkText:
        "This page was translated from English by the community. Learn more and join the MDN Web Docs community.",
    },
    fr: {
      linkText:
        "Cette page a été traduite à partir de l'anglais par la communauté. Vous pouvez également contribuer en rejoignant la communauté francophone sur MDN Web Docs.",
    },
    ja: {
      linkText:
        "このページはコミュニティーの尽力で英語から翻訳されました。MDN Web Docs コミュニティーについてもっと知り、仲間になるにはこちらから。",
    },
    ko: {
      linkText:
        "이 페이지는 영어로부터 커뮤니티에 의하여 번역되었습니다. MDN Web Docs에서 한국 커뮤니티에 가입하여 자세히 알아보세요.",
    },
    ru: {
      linkText:
        "Эта страница была переведена с английского языка силами сообщества. Вы тоже можете внести свой вклад, присоединившись к русскоязычному сообществу MDN Web Docs.",
    },
    "zh-CN": {
      linkText:
        "此页面由社区从英文翻译而来。了解更多并加入 MDN Web Docs 社区。",
    },
  };
  const inactiveLocaleNoteContent = {
    de: {
      linkText:
        "Der Inhalt dieser Seite wurde von der Community übersetzt, jedoch wird er nicht mehr aktiv gepflegt und kann daher veraltet sein. Wenn du mithelfen möchtest, kannst du hier herausfinden wie deaktivierte Übersetzungen reaktiviert werden können.",
    },
    "en-US": {
      linkText:
        "This page was translated from English by the community, but it's not maintained and may be out-of-date. To help maintain it, learn how to activate locales.",
    },
    es: {
      linkText:
        "Esta página fue traducida del inglés por la comunidad, pero no se mantiene activamente, por lo que puede estar desactualizada. Si desea ayudar a mantenerlo, descubra cómo activar las configuraciones regionales inactivas.",
    },
  };

  const linkText = isActive
    ? (activeLocaleNoteContent[locale] &&
        activeLocaleNoteContent[locale].linkText) ||
      activeLocaleNoteContent["en-US"].linkText
    : (inactiveLocaleNoteContent[locale] &&
        inactiveLocaleNoteContent[locale].linkText) ||
      inactiveLocaleNoteContent["en-US"].linkText;
  const url = isActive
    ? "/en-US/docs/MDN/Contribute/Localize#active_locales"
    : "https://github.com/mdn/translated-content/blob/main/PEERS_GUIDELINES.md#activating-a-locale";

  const type = isActive ? "neutral" : "warning";
  return <NoteBanner linkText={linkText} url={url} type={type} />;
}
