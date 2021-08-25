export function DisplayHeading({
  level,
  id,
  title,
  titleAsText,
}: {
  level: number;
  id: string;
  title: string;
  titleAsText?: string;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag id={id.toLowerCase()}>
      <Permalink id={id} title={title} titleAsText={titleAsText} />
    </Tag>
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
