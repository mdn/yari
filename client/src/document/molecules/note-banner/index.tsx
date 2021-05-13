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
    <div className={`localized-content-note notecard inline ${type}`}>
      <a href={url} className={!url.startsWith("/") ? "external" : undefined}>
        {linkText}
      </a>
    </div>
  );
}
