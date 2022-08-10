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
