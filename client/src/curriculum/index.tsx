import useSWR from "swr";
import { Route, Routes } from "react-router-dom";

import { HydrationData } from "../../../libs/types/hydration";
import { ModuleData } from "../../../libs/types/curriculum";
import { HTTPError, RenderDocumentBody } from "../document";
import { PLACEMENT_ENABLED, WRITER_MODE } from "../env";
import { TOC } from "../document/organisms/toc";
import { SidePlacement } from "../ui/organisms/placement";
import { Sidebar } from "./sidebar";
import { ModulesListList } from "./modules";
import { CurriculumModuleOverview } from "./overview";
import { CurriculumModule } from "./module";

import "./index.scss";

export function Curriculum(appProps: HydrationData) {
  return (
    <Routes>
      <Route path="/" element={<CurriculumLanding {...appProps} />} />
      <Route
        path="/:module"
        element={<CurriculumModuleOverview {...appProps} />}
      />
      <Route path="/*" element={<CurriculumModule {...appProps} />} />
    </Routes>
  );
}

export function CurriculumLanding(props: HydrationData) {
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
  const { doc, curriculumMeta } = data || props || {};
  return (
    <>
      {doc && (
        <main className="curriculum-content-container container">
          <div className="sidebar-container">
            <div className="toc-container">
              <aside className="toc">
                <nav>
                  {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}
                </nav>
              </aside>
              {PLACEMENT_ENABLED && <SidePlacement />}
            </div>
            <Sidebar sidebar={doc.sidebar}></Sidebar>
          </div>
          <article className="curriculum-content" lang={doc?.locale}>
            <header>
              <h1>{doc?.title}</h1>
              {curriculumMeta?.topic && <p>{curriculumMeta.topic}</p>}
            </header>
            <RenderDocumentBody doc={doc} />
            <section className="modules">
              <h2>Modules:</h2>
              <ModulesListList modules={doc.modules} />
            </section>
          </article>
        </main>
      )}
    </>
  );
}
