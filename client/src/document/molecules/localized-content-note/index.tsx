interface LocalizedNoteContent {
  lead: string;
  url: string;
  linkText: string;
}

function getNote(noteContent: LocalizedNoteContent, noteType: string) {
  return (
    <div className={`localized-content-note notecard inline ${noteType}`}>
      {noteContent.lead}{" "}
      <a href={noteContent.url} className="external">
        {noteContent.linkText}
      </a>
    </div>
  );
}

export function LocalizedContentNote({
  isActive,
  locale,
}: {
  isActive: boolean;
  locale: string;
}) {
  const activeLocaleNoteContent = {
    "en-US": {
      lead: "This page was translated from English by the community.",
      linkText: "Learn more and join the MDN Web Docs community.",
      url: "https://developer.mozilla.org/en-US/docs/MDN/Contribute/Localize",
    },
    fr: {
      lead:
        "Cette page a été traduite à partir de l'anglais par la communauté.",
      linkText:
        "Vous pouvez également contribuer en rejoignant la communauté francophone sur MDN Web Docs.",
      url:
        "https://developer.mozilla.org/en-US/docs/MDN/Contribute/Localize#french_fr",
    },
    ko: {
      lead: "이 페이지는 커뮤니티에서 영어로 번역되었습니다.",
      linkText: "MDN Web Docs에서 한국 커뮤니티에 가입하여 자세히 알아보세요.",
      url: "https://developer.mozilla.org/en-US/docs/MDN/Contribute/Localize",
    },
  };
  const inactiveLocaleNoteContent = {
    de: {
      lead:
        "Der Inhalt dieser Seite wurde von der Community übersetzt, jedoch wird er nicht mehr aktiv gepflegt und kann daher veraltet sein. Wenn du mithelfen möchtest, kannst du",
      linkText:
        "hier herausfinden wie deaktivierte Übersetzung reaktiviert werden.",
      url:
        "https://github.com/mdn/translated-content#promoting-an-inactive-locale-to-tier-1",
    },
    "en-US": {
      lead:
        "This page was translated from English by the community, but it is not actively maintained therefore it may be out-of-date. If you'd like to help maintain it, ",
      linkText: "find out how to activate inactive locales.",
      url:
        "https://github.com/mdn/translated-content#promoting-an-inactive-locale-to-tier-1",
    },
    es: {
      lead:
        "Esta página fue traducida del inglés por la comunidad, pero no se mantiene activamente, por lo que puede estar desactualizada.",
      linkText:
        "Si desea ayudar a mantenerlo, descubra cómo activar las configuraciones regionales inactivas.",
      url:
        "https://github.com/mdn/translated-content#promoting-an-inactive-locale-to-tier-1",
    },
  };

  const noteContent = isActive
    ? activeLocaleNoteContent[locale] || activeLocaleNoteContent["en-US"]
    : inactiveLocaleNoteContent[locale] || inactiveLocaleNoteContent["en-US"];
  const noteType = isActive ? "neutral" : "warning";

  return getNote(noteContent, noteType);
}
