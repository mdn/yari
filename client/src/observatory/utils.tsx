export function Link({ href, children }: { href: string; children: any }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${href.startsWith("/") ? "" : "external"}`}
    >
      {children}
    </a>
  );
}
