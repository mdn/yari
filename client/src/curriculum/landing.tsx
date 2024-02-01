import useSWR from "swr";

import { ReactComponent as LandingSVG } from "../../public/assets/curriculum/cur-landing-top.svg";
import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, ModuleData } from "../../../libs/types/curriculum";
import { HTTPError, RenderDocumentBody } from "../document";
import { PLACEMENT_ENABLED, WRITER_MODE } from "../env";
import { SidePlacement } from "../ui/organisms/placement";
import { ModulesListList } from "./modules-list";

import "./index.scss";
import "./no-side.scss";
import "./landing.scss";

import { TopNavigation } from "../ui/organisms/top-navigation";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { topic2css, useDocTitle } from "./utils";

export function CurriculumLanding(props: HydrationData<any, CurriculumDoc>) {
  const dataURL = `./index.json`;
  const { data } = useSWR<ModuleData>(
    dataURL,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new HTTPError(response.status, url, "Page not found");
        }

        const text = await response.text();
        throw new HTTPError(response.status, url, text);
      }

      return await response.json();
    },
    {
      fallbackData: props as ModuleData,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: !props.blogMeta,
    }
  );
  const { doc }: { doc?: CurriculumDoc } = data || props || {};
  useDocTitle(doc);
  return (
    <>
      {doc && (
        <>
          <div className="sticky-header-container">
            <TopNavigation />
            <ArticleActionsContainer doc={doc} />
          </div>
          <main className="curriculum-content-container container curriculum-no-side curriculum-landing">
            <div className="sidebar-container">
              <div className="toc-container">
                {PLACEMENT_ENABLED && <SidePlacement />}
              </div>
            </div>
            <article className="curriculum-content" lang={doc?.locale}>
              <header>
                <LandingSVG />
                <h1>{doc?.title}</h1>
                {doc?.topic && <p>{doc.topic}</p>}
              </header>
              <RenderDocumentBody doc={doc} />
              <section className="modules">
                <h2>Modules</h2>
                {doc.modules && <ModulesListList modules={doc.modules} />}
              </section>
            </article>
          </main>
        </>
      )}
    </>
  );
}
