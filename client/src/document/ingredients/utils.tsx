export function DisplayH2({
  id,
  title,
  titleAsText,
}: {
  id: string;
  title: string;
  titleAsText?: string;
}) {
  return (
    <h2 id={id.toLowerCase()}>
      <Permalink title={title} titleAsText={titleAsText} id={id} />
    </h2>
  );
}

export function DisplayH3({
  id,
  title,
  titleAsText,
}: {
  id: string;
  title: string;
  titleAsText?: string;
}) {
  return (
    <h3 id={id.toLowerCase()}>
      <Permalink title={title} titleAsText={titleAsText} id={id} />
    </h3>
  );
}

export function DisplayH4({
  id,
  title,
  titleAsText,
}: {
  id: string;
  title: string;
  titleAsText?: string;
}) {
  return (
    <h4 id={id.toLowerCase()}>
      <Permalink title={title} titleAsText={titleAsText} id={id} />
    </h4>
  );
}

function Permalink({
  id,
  title,
  titleAsText,
}: {
  id: string;
  title: string;
  titleAsText?: string;
}) {
  return (
    <a
      href={`#${id.toLowerCase()}`}
      title={`Permalink to ${titleAsText || title}`}
      dangerouslySetInnerHTML={{ __html: title }}
    ></a>
  );
}
