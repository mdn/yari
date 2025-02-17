import React, { ReactElement } from "react";
import useSWR from "swr";
import { DEV_MODE, PLACEMENT_ENABLED } from "../../env";
import { SidebarContainer } from "../../document/organisms/sidebar";
import { TOC } from "../../document/organisms/toc";
import { Section, Toc } from "../../../../libs/types/document";
import { PageNotFound } from "../../page-not-found";
import { Loading } from "../../ui/atoms/loading";
import { SidePlacement } from "../../ui/organisms/placement";
import { Prose } from "../../document/ingredients/prose";

interface StaticPageDoc {
  id: string;
  title: string;
  sections: Section[];
  toc: Toc[];
}

export interface StaticPageProps {
  extraClasses?: string;
  locale: string;
  slug: string;
  fallbackData?: any;
  title?: string;
  sidebarHeader?: ReactElement;
  children?: React.ReactNode;
  additionalToc?: Toc[];
}

function StaticPage({
  extraClasses = "",
  locale,
  slug,
  fallbackData = undefined,
  title = "MDN",
  sidebarHeader = <></>,
  children = <></>,
  additionalToc = [],
}: StaticPageProps) {
  const baseURL = `/${locale}/${slug}`;
  const featureJSONUrl = `${baseURL}/index.json`;
  const { data: { hyData } = {}, error } = useSWR<{ hyData: StaticPageDoc }>(
    featureJSONUrl,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      fallbackData,
      revalidateOnFocus: DEV_MODE,
      revalidateOnMount: !fallbackData,
    }
  );

  React.useEffect(() => {
    document.title = hyData ? `${hyData.title} | ${title}` : title;
  }, [hyData, title]);

  if (error) {
    return <PageNotFound />;
  } else if (!hyData) {
    return <Loading />;
  }

  return (
    <>
      <div className="main-wrapper">
        <div className="sidebar-container">
          <SidebarContainer doc={hyData}>
            {sidebarHeader || null}
          </SidebarContainer>
          <div className="toc-container">
            <aside className="toc">
              <nav>
                {hyData.toc && !!hyData.toc.length && (
                  <TOC toc={[...hyData.toc, ...additionalToc]} />
                )}
              </nav>
            </aside>
            {PLACEMENT_ENABLED && <SidePlacement />}
          </div>
        </div>
        <main id="content" className="main-content" role="main">
          <article className={`main-page-content ${extraClasses || ""}`}>
            {hyData.sections.map((section, index) => (
              <Prose key={section.value.id || index} section={section.value} />
            ))}
            {children}
          </article>
        </main>
      </div>
    </>
  );
}

export default StaticPage;
