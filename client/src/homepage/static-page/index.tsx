// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { ReactElement } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'swr'. Did you mean to set the ... Remove this comment to see the full error message
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../document/organisms/sideb... Remove this comment to see the full error message
import { SidebarContainer } from "../../document/organisms/sidebar";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../document/organisms/toc'.... Remove this comment to see the full error message
import { TOC } from "../../document/organisms/toc";
import { DocParent, Toc } from "../../document/types";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../page-not-found'. Did you... Remove this comment to see the full error message
import { PageNotFound } from "../../page-not-found";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/loading'. Did y... Remove this comment to see the full error message
import { Loading } from "../../ui/atoms/loading";
import { useUIStatus } from "../../ui-context";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/button'. Did yo... Remove this comment to see the full error message
import { Button } from "../../ui/atoms/button";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/breadcrumbs... Remove this comment to see the full error message
import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";

interface StaticPageDoc {
  id: string;
  title: string;
  sections: string[];
  toc: Toc[];
}

interface StaticPageProps {
  extraClasses?: string;
  locale: string;
  slug: string;
  parents: DocParent[];
  fallbackData?: any;
  title?: string;
  sidebarHeader?: ReactElement;
}

function StaticPage({
  extraClasses = "",
  locale,
  slug,
  parents = [],
  fallbackData = undefined,
  title = "MDN",
  sidebarHeader = <></>,
}: StaticPageProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useUIStatus();
  const baseURL = `/${locale}/${slug}`;
  const featureJSONUrl = `${baseURL}/index.json`;
  // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
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
      revalidateOnFocus: CRUD_MODE,
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

  const toc = hyData.toc?.length && <TOC toc={hyData.toc} />;

  return (
    <>
      <div className="article-actions-container">
        <div className="container">
          <Button
            extraClasses="sidebar-button"
            icon="sidebar"
            type="action"
            onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {
            <Breadcrumbs
              parents={[...parents, { uri: baseURL, title: hyData.title }]}
            />
          }
        </div>
      </div>

      <div className="main-wrapper">
        <SidebarContainer doc={hyData}>
          {sidebarHeader || null}
        </SidebarContainer>
        <div className="toc">{toc || null}</div>
        <main id="content" className="main-content" role="main">
          <article className={`main-page-content ${extraClasses || ""}`}>
            {hyData.sections.map((section, index) => (
              <section
                key={index}
                dangerouslySetInnerHTML={{ __html: section }}
              ></section>
            ))}
          </article>
        </main>
      </div>
    </>
  );
}

export default StaticPage;
