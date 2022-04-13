import { DisplayH2, DisplayH3 } from "./utils";

export function Prose({ id, section }: { id?: string; section: any }) {
  return (
    <section
      aria-labelledby={id}
      dangerouslySetInnerHTML={{ __html: section.content }}
    />
  );
}

export function ProseWithHeading({
  id,
  section,
}: {
  id: string;
  section: any;
}) {
  return (
    <>
      {section.isH3 ? (
        <DisplayH3
          id={id}
          title={section.title}
          titleAsText={section.titleAsText}
        />
      ) : (
        <DisplayH2
          id={id}
          title={section.title}
          titleAsText={section.titleAsText}
        />
      )}
      <Prose id={id} section={section} />
    </>
  );
}
