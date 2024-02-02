import useSWR from "swr";

import { ReactComponent as LandingSVG } from "../../public/assets/curriculum/cur-landing-top.svg";
import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumDoc, ModuleData } from "../../../libs/types/curriculum";
import { HTTPError } from "../document";
import { WRITER_MODE } from "../env";
import { ModulesListList } from "./modules-list";

import "./index.scss";
import "./no-side.scss";
import "./landing.scss";

import { TopNavigation } from "../ui/organisms/top-navigation";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { useDocTitle } from "./utils";
import { RenderCurriculumBody } from "./body";
import { useMemo } from "react";
import { DisplayH2 } from "../document/ingredients/utils";

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
          <main className="curriculum-content-container container curriculum-landing">
            <article className="curriculum-content" lang={doc?.locale}>
              <RenderCurriculumBody
                doc={doc}
                renderer={(section, i) => {
                  if (i === 0) {
                    return <Header section={section} h1={doc?.title} />;
                  }
                  if (section.value.id === "about_curriculum") {
                    return About({ section });
                  }
                  if (section.value.id === "modules") {
                    const { title, titleAsText, id } = section.value as any;
                    return (
                      <section className="modules">
                        <DisplayH2
                          id={id}
                          title={title}
                          titleAsText={titleAsText}
                        />
                        {doc.modules && (
                          <ModulesListList modules={doc.modules} />
                        )}
                      </section>
                    );
                  }
                  return null;
                }}
              />
            </article>
          </main>
        </>
      )}
    </>
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
