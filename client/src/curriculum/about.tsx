import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, CurriculumData } from "../../../libs/types/curriculum";
import { topic2css, useCurriculumDoc } from "./utils";
import { RenderCurriculumBody } from "./body";
import { CurriculumLayout } from "./layout";

import "./index.scss";
import "./about.scss";

export function CurriculumAbout(props: HydrationData<any, CurriculumDoc>) {
  const doc = useCurriculumDoc(props as CurriculumData);
  const [coloredTitle, ...restTitle] = doc?.title?.split(" ") || [];
  return (
    <CurriculumLayout
      doc={doc}
      extraClasses={["curriculum-about", `topic-${topic2css(doc?.topic)}`]}
    >
      <header>
        <h1>
          <span>{coloredTitle}</span> {restTitle.join(" ")}
        </h1>
      </header>
      <RenderCurriculumBody doc={doc} />
    </CurriculumLayout>
  );
}
