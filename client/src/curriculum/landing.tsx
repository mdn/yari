import { ReactComponent as LandingSVG } from "../../public/assets/curriculum/cur-landing-top.svg";
import { ReactComponent as LandingStairwaySVG1 } from "../../public/assets/curriculum/cur-landing-stairway-1.svg";
import { ReactComponent as LandingStairwaySVG2 } from "../../public/assets/curriculum/cur-landing-stairway-2.svg";
import { ReactComponent as LandingStairwaySVG2Small } from "../../public/assets/curriculum/cur-landing-stairway-2-small.svg";
import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, CurriculumData } from "../../../libs/types/curriculum";
import { ModulesListList } from "./modules-list";
import { useCurriculumDoc } from "./utils";
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
            return (
              <Header
                section={section}
                key={section.value.id}
                h1={doc?.title}
              />
            );
          }
          if (section.value.id === "about_the_curriculum") {
            return About({ section });
          }
          if (section.value.id === "modules") {
            const { title, titleAsText, id } = section.value as any;
            return (
              <>
                <section key={`${section.value.id}-1`} className="modules">
                  <DisplayH2 id={id} title={title} titleAsText={titleAsText} />
                  {doc.modules && <ModulesListList modules={doc.modules} />}
                </section>
                <section
                  key={`${section.value.id}-2`}
                  className="landing-stairway"
                >
                  <div>
                    <div id="lad1-container">
                      <LandingStairwaySVG1 />
                      <p id="lad1">
                        <span id="lad1_how_can">How can you</span>
                        <span id="lad1_boost" className="color">
                          boost your employability{" "}
                        </span>
                        <span id="lad1_with">with the MDN</span>
                        <span id="lad1_cur">Curriculum?</span>
                      </p>
                    </div>
                    <div id="lad2-container">
                      <LandingStairwaySVG2 />
                      <LandingStairwaySVG2Small />
                      <p id="lad2">
                        <span id="stair-1">
                          Learn about research collaboration and other essential
                          soft skills.
                        </span>
                        <span id="stair-2">
                          Balance between modern tooling and long-term best
                          practices.
                        </span>
                        <span id="stair-3">
                          Get access to hight-quality recommended resources.
                        </span>
                        <span id="stair-4">
                          Get guidance from trusted voices.
                        </span>
                      </p>
                    </div>
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
      <section>
        <h1>{h1}</h1>
        <h2>{section.value.title}</h2>
        <div dangerouslySetInnerHTML={html}></div>
      </section>
      <LandingSVG aria-label="woman in chair" role="img" />
    </header>
  );
}

function About({ section }) {
  const { title, content, titleAsText, id } = section.value;
  const html = useMemo(() => ({ __html: content }), [content]);
  return (
    <section key={id} className="landing-about-container">
      <div className="landing-about">
        <DisplayH2 id={id} title={title} titleAsText={titleAsText} />
        <div dangerouslySetInnerHTML={html}></div>
      </div>
    </section>
  );
}
