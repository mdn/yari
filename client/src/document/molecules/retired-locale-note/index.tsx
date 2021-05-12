import { NoteBanner, NoteContent, NOTE_TYPES } from "../note-banner";

export function RetiredLocaleNote() {
  const noteContent: NoteContent = {
    linkText:
      "The page you requested has been retired, so we've sent you to the English equivalent.",
    url:
      "https://hacks.mozilla.org/2021/03/mdn-localization-in-march-tier-1-locales-unfrozen-and-future-plans/",
  };
  return NoteBanner(noteContent, NOTE_TYPES.general);
}
