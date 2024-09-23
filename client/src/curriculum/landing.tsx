import { ReactComponent as LandingSVG } from "../../public/assets/curriculum/curriculum-landing-top.svg";
import { ReactComponent as LandingStairwaySVG1 } from "../../public/assets/curriculum/curriculum-landing-stairway-1.svg";
import { ReactComponent as LandingStairwaySVG2 } from "../../public/assets/curriculum/curriculum-landing-stairway-2.svg";
import { ReactComponent as LandingStairwaySVG2Small } from "../../public/assets/curriculum/curriculum-landing-stairway-2-small.svg";
import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, CurriculumData } from "../../../libs/types/curriculum";
import { ModulesListList } from "./modules-list";
import { useCurriculumDoc } from "./utils";
import { RenderCurriculumBody } from "./body";
import { lazy, Suspense, useMemo } from "react";
import { DisplayH2 } from "../document/ingredients/utils";
import { CurriculumLayout } from "./layout";

import "./index.scss";
import "./landing.scss";
import { ProseSection } from "../../../libs/types/document";
import { PartnerBanner } from "./partner-banner";
import { useIsServer } from "../hooks";

const ScrimInline = lazy(() => import("./scrim-inline"));

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
            const { title, id } = (section as ProseSection).value;
            console.log(title);
            return (
              <>
                <section key={`${id}-1`} className="modules">
                  {title && <DisplayH2 id={id} title={title} />}
                  {doc?.modules && <ModulesListList modules={doc.modules} />}
                </section>
                <PartnerBanner />

                <section key={`${id}-2`} className="landing-stairway">
                  <div>
                    <div id="stairway1-container">
                      <LandingStairwaySVG1
                        aria-label="woman presenting the following text"
                        role="img"
                      />
                      <p id="stairway1">
                        <span id="stairway1_how_can">How can you</span>
                        <span id="stairway1_boost" className="color">
                          boost your employability{" "}
                        </span>
                        <span id="stairway1_with">with the MDN</span>
                        <span id="stairway1_cur">Curriculum?</span>
                      </p>
                    </div>
                    <div id="stairway2-container">
                      <LandingStairwaySVG2
                        aria-label="woman on top of a stairway with a flag"
                        role="img"
                        id="stairway2large"
                      />
                      <LandingStairwaySVG2Small
                        aria-label="woman on top of a stairway with a flag"
                        role="img"
                        id="stairway2small"
                      />
                      <p id="stairway2">
                        <span id="stair-1">
                          Learn about research collaboration and other essential
                          soft skills.
                        </span>
                        <span id="stair-2">
                          Balance between modern tooling and long-term best
                          practices.
                        </span>
                        <span id="stair-3">
                          Get access to high-quality recommended resources.
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

const SCRIM_URL = "https://v2.scrimba.com/s06icdv?via=mdn";

function About({ section }) {
  const { title, content, id } = section.value;
  const html = useMemo(() => ({ __html: content }), [content]);
  const isServer = useIsServer();

  return (
    <section key={id} className="landing-about-container">
      <div className="landing-about">
        <DisplayH2 id={id} title={title} />
        <div className="about-content" dangerouslySetInnerHTML={html}></div>
        <div className="arrow"></div>
        <section className="scrim-wrapper">
          <div className="scrim-border">
            <Suspense>{!isServer && <ScrimInline url={SCRIM_URL} />}</Suspense>
          </div>
          <p>
            Learn our curriculum with high quality, interactive courses from our
            partner{" "}
            <a
              href="https://scrimba.com/?via=mdn"
              className="external"
              target="_blank"
              rel="noreferrer"
            >
              Scrimba
            </a>
            {" !"}
          </p>
        </section>
      </div>
    </section>
  );
}
