import useSWR from "swr";
import { HydrationData } from "../../../libs/types/hydration";
import { ModuleData, SidebarEntry } from "../../../libs/types/curriculum";
import { HTTPError, RenderDocumentBody } from "../document";
import { PLACEMENT_ENABLED, WRITER_MODE } from "../env";
import { TOC } from "../document/organisms/toc";
import { SidePlacement } from "../ui/organisms/placement";

import "./module.scss";

export function CurriculumModule(props: HydrationData) {
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
          </article>
        </main>
      )}
    </>
  );
}

function Sidebar({ sidebar = [] }: { sidebar: SidebarEntry[] }) {
  return (
    <aside className="sidebar">
      <ol>
        {sidebar.map((o) => (
          <li>
            <a href={o.url}>{o.title}</a>
            {o.children && (
              <ol>
                {o.children.map((c) => {
                  return (
                    <li>
                      <a href={c.url}>{c.title}</a>
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}
