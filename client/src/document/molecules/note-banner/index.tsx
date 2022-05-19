// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../../ui/molecules/notecard... Remove this comment to see the full error message
import NoteCard from "../../../ui/molecules/notecards";

export function NoteBanner({
  linkText,
  url,
  type,
}: {
  linkText: string;
  url: string;
  type: "neutral" | "warning";
}) {
  return (
    <NoteCard extraClasses={`localized-content-note ${type || ""}`}>
      <p>
        <a href={url} className={!url.startsWith("/") ? "external" : undefined}>
          {linkText}
        </a>
      </p>
    </NoteCard>
  );
}
