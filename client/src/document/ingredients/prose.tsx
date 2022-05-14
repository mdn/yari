import { DisplayH2, DisplayH3 } from "./utils";

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

  const DisplayHx = section.isH3 ? DisplayH3 : DisplayH2;

  return (
    <section aria-labelledby={id}>
      <DisplayHx
        id={id}
        title={section.title}
        titleAsText={section.titleAsText}
      />
      <Content />
    </section>
  );
}
