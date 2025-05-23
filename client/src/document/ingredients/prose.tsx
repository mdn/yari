import { useEffect, useMemo } from "react";
import { DisplayH2, DisplayH3 } from "./utils";

export function Prose({ section }: { section: any }) {
  const { id } = section;
  const html = useMemo(() => ({ __html: section.content }), [section.content]);

  useEffect(() => {
    if (html.__html.includes("<scrim-inline")) {
      import("../../lit/curriculum/scrim-inline");
    }
  }, [html]);

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
