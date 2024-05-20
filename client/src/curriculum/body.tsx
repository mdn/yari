import { CurriculumDoc } from "../../../libs/types/curriculum";
import { Section } from "../../../libs/types/document";
import { Prose } from "../document/ingredients/prose";

export function RenderCurriculumBody({
  doc,
  renderer = () => null,
}: {
  doc?: CurriculumDoc;
  renderer?: (section: Section, i: number) => null | JSX.Element;
}) {
  return doc?.body.map((section, i) => {
    return (
      renderer(section, i) || (
        <Prose key={section.value.id} section={section.value} />
      )
    );
  });
}
