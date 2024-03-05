import { useMemo } from "react";
import { DisplayH2, DisplayH3 } from "./utils";

export function Prose({ section }: { section: any }) {
  const { id } = section;
  const html = useMemo(() => ({ __html: section.content }), [section.content]);

  if (!id) {
    return <div className="section-content" dangerouslySetInnerHTML={html} />;
  }

  const DisplayHx = section.isH3 ? DisplayH3 : DisplayH2;

  return (
    <section aria-labelledby={id}>
      <DisplayHx id={id} title={section.title} />
      <div className="section-content" dangerouslySetInnerHTML={html} />
    </section>
  );
}
