export interface NoteContent {
  linkText: string;
  url: string;
}

// map note types to classNames
export const NOTE_TYPES = {
  general: "neutral",
  warning: "warning",
};

export function NoteBanner(noteContent: NoteContent, noteType: string) {
  return (
    <div className={`localized-content-note notecard inline ${noteType}`}>
      <a
        href={noteContent.url}
        className={!noteContent.url.startsWith("/") ? "external" : undefined}
      >
        {noteContent.linkText}
      </a>
    </div>
  );
}
