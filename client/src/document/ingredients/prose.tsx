import { DisplayHeading } from "./utils";

export function Prose({ section }) {
  return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
}

export function ProseWithHeading({ id, section }) {
  return (
    <>
      <DisplayHeading
        level={section.isH4 ? 4 : section.isH3 ? 3 : 2}
        id={id}
        title={section.title}
        titleAsText={section.titleAsText}
      />
      <Prose section={section} />
    </>
  );
}
