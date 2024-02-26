export function DisplayH2({
  id,
  title,
}: {
  id?: string | null;
  title: string;
}) {
  return (
    <h2 id={id ? id.toLowerCase() : undefined}>
      {id ? <Permalink title={title} id={id} /> : title}
    </h2>
  );
}

export function DisplayH3({ id, title }: { id: string; title: string }) {
  return (
    <h3 id={id.toLowerCase()}>
      <Permalink title={title} id={id} />
    </h3>
  );
}

function Permalink({ id, title }: { id: string; title: string }) {
  return (
    <a
      href={`#${id.toLowerCase()}`}
      dangerouslySetInnerHTML={{ __html: title }}
    ></a>
  );
}
