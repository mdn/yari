import { DisplayH2, DisplayH3, DisplayH4 } from "./utils";

export function Prose({ section }) {
  return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
}

export function ProseWithHeading({ id, section }) {
  return (
    <>
      {section.isH4 && (
        <DisplayH4
          id={id}
          title={section.title}
          titleAsText={section.titleAsText}
        />
      )}
      {section.isH3 && !section.isH4 && (
        <DisplayH3
          id={id}
          title={section.title}
          titleAsText={section.titleAsText}
        />
      )}
      {!section.isH4 && !section.isH3 && (
        <DisplayH2
          id={id}
          title={section.title}
          titleAsText={section.titleAsText}
        />
      )}
      <Prose section={section} />
    </>
  );
}
