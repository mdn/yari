import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, CurriculumData } from "../../../libs/types/curriculum";
import { ModulesList } from "./modules-list";
import { topic2css, useCurriculumDoc } from "./utils";
import { PrevNext } from "./prev-next";
import { RenderCurriculumBody } from "./body";
import { CurriculumLayout } from "./layout";

import "./index.scss";

export function CurriculumModuleOverview(
  props: HydrationData<any, CurriculumDoc>
) {
  const doc = useCurriculumDoc(props as CurriculumData);
  // ["Getting", "started", "modules"]
  const titleParts = doc?.title?.split(" ") || [];
  // "Getting started"
  const coloredTitle = titleParts.slice(0, -1).join(" ");
  // "modules"
  const restTitle = titleParts.at(-1);
  return (
    <CurriculumLayout
      doc={doc}
      extraClasses={["curriculum-overview", `topic-${topic2css(doc?.topic)}`]}
    >
      <header>
        <h1>
          <span>{coloredTitle}</span> {restTitle}
        </h1>
      </header>
      <RenderCurriculumBody doc={doc} />
      <section className="module-contents">
        <h2>Module list</h2>
        {doc?.modules && <ModulesList modules={doc.modules} />}
      </section>
      <PrevNext doc={doc} />
    </CurriculumLayout>
  );
}
