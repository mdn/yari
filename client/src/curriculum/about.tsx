import useSWR from "swr";

import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, ModuleData } from "../../../libs/types/curriculum";
import { HTTPError } from "../document";
import { PLACEMENT_ENABLED, WRITER_MODE } from "../env";
import { SidePlacement } from "../ui/organisms/placement";

import "./index.scss";
import "./no-side.scss";
import "./about.scss";

import { TopNavigation } from "../ui/organisms/top-navigation";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { topic2css, useDocTitle } from "./utils";
import { SidebarContainer } from "../document/organisms/sidebar";
import { TOC } from "../document/organisms/toc";
import { RenderCurriculumBody } from "./body";
import { Sidebar } from "./sidebar";

export function CurriculumAbout(props: HydrationData<any, CurriculumDoc>) {
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
  const [coloredTitle, ...restTitle] = doc?.title?.split(" ") || [];
  return (
    <>
      {doc && (
        <>
          <div className="sticky-header-container">
            <TopNavigation />
            <ArticleActionsContainer doc={doc} />
          </div>
          <main
            className={`curriculum-content-container container curriculum-no-side topic-${topic2css(doc.topic)}`}
          >
            <div className="sidebar-container">
              <SidebarContainer doc={doc} label="Related Topics">
                {doc.sidebar && (
                  <Sidebar current={doc.mdn_url} sidebar={doc.sidebar} />
                )}
              </SidebarContainer>
              <div className="toc-container">
                <aside className="toc">
                  <nav>
                    {doc.toc && !!doc.toc.length && (
                      <TOC toc={doc.toc} title="In this module" />
                    )}
                  </nav>
                </aside>
                {PLACEMENT_ENABLED && <SidePlacement />}
              </div>
              {doc.sidebar && (
                <Sidebar
                  extraClasses="sidebar"
                  current={doc.mdn_url}
                  sidebar={doc.sidebar}
                />
              )}
            </div>
            <article
              className="curriculum-content curriculum-about"
              lang={doc?.locale}
            >
              <header>
                <h1>
                  <span>{coloredTitle}</span> {restTitle.join(" ")}
                </h1>
              </header>
              <RenderCurriculumBody doc={doc} />
            </article>
          </main>
        </>
      )}
    </>
  );
}
