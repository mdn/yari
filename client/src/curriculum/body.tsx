import { useMemo } from "react";
import { DisplayH2, DisplayH3 } from "../document/ingredients/utils";
import { CurriculumDoc } from "../../../libs/types/curriculum";
import { Section } from "../../../libs/types/document";

function Render({ section }) {
  const { id } = section;
  const html = useMemo(() => ({ __html: section.content }), [section.content]);

  if (!id) {
    return (
      <div
        key={section.id}
        className="section-content"
        dangerouslySetInnerHTML={html}
      />
    );
  }

  const DisplayHx = section.isH3 ? DisplayH3 : DisplayH2;

  return (
    <section aria-labelledby={id} key={section.id}>
      <DisplayHx
        id={id}
        title={section.title}
        titleAsText={section.titleAsText}
      />
      <div className="section-content" dangerouslySetInnerHTML={html} />
    </section>
  );
}

export function RenderCurriculumBody({
  doc,
  renderer = () => null,
}: {
  doc: CurriculumDoc;
  renderer?: (section: Section, i: number) => null | JSX.Element;
}) {
  return doc.body.map((section, i) => {
    return renderer(section, i) || <Render section={section.value} />;
  });
}
