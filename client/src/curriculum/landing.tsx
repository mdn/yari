import { ReactComponent as LandingSVG } from "../../public/assets/curriculum/cur-landing-top.svg";
import { ReactComponent as LandingLadderSVG1 } from "../../public/assets/curriculum/cur-landing-ladder-1.svg";
import { ReactComponent as LandingLadderSVG2 } from "../../public/assets/curriculum/cur-landing-ladder-2.svg";
import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, CurriculumData } from "../../../libs/types/curriculum";
import { ModulesListList } from "./modules-list";
import { useCurriculumDoc, useDocTitle } from "./utils";
import { RenderCurriculumBody } from "./body";
import { useMemo } from "react";
import { DisplayH2 } from "../document/ingredients/utils";
import { CurriculumLayout } from "./layout";

import "./index.scss";
import "./landing.scss";

export function CurriculumLanding(appProps: HydrationData<any, CurriculumDoc>) {
  const doc = useCurriculumDoc(appProps as CurriculumData);
  return (
    <CurriculumLayout
      doc={doc}
      withSidebar={false}
      extraClasses={["curriculum-landing"]}
    >
      <RenderCurriculumBody
        doc={doc}
        renderer={(section, i) => {
          if (i === 0) {
            return <Header section={section} h1={doc?.title} />;
          }
          if (section.value.id === "about_the_curriculum") {
            return About({ section });
          }
          if (section.value.id === "modules") {
            const { title, titleAsText, id } = section.value as any;
            return (
              <>
                <section className="modules">
                  <DisplayH2 id={id} title={title} titleAsText={titleAsText} />
                  {doc.modules && <ModulesListList modules={doc.modules} />}
                </section>
                <section className="landing-ladder">
                  <div>
                    <LandingLadderSVG1 />
                    <LandingLadderSVG2 />
                  </div>
                </section>
              </>
            );
          }
          return null;
        }}
      />
    </CurriculumLayout>
  );
}

function Header({ section, h1 }: { section: any; h1?: string }) {
  const html = useMemo(
    () => ({ __html: section.value?.content }),
    [section.value?.content]
  );
  return (
    <header className="landing-header">
      <LandingSVG />
      <section>
        <h1>{h1}</h1>
        <h2>{section.value.title}</h2>
        <div dangerouslySetInnerHTML={html}></div>
      </section>
    </header>
  );
}

function About({ section }) {
  const { title, content, titleAsText, id } = section.value;
  const html = useMemo(() => ({ __html: content }), [content]);
  return (
    <section className="landing-about-container">
      <div className="landing-about">
        <DisplayH2 id={id} title={title} titleAsText={titleAsText} />
        <div dangerouslySetInnerHTML={html}></div>
      </div>
    </section>
  );
}
