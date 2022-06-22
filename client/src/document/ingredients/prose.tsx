import { DisplayHeading } from "./utils";

export function Prose({ section }: { section: any }) {
  const { id } = section;

  const Content = () => (
    <div
      className="section-content"
      dangerouslySetInnerHTML={{ __html: section.content }}
    />
  );

  if (!id) {
    return <Content />;
  }

  return (
    <section aria-labelledby={id}>
      <DisplayHeading
        level={section.isH4 ? 4 : section.isH3 ? 3 : 2}
        id={id}
        title={section.title}
        titleAsText={section.titleAsText}
      />
      <Content />
    </section>
  );
}
