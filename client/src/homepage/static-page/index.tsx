import React, { ReactElement } from "react";
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { TOC } from "../../document/organisms/toc";
import { PageNotFound } from "../../page-not-found";
import { Loading } from "../../ui/atoms/loading";

interface StaticPageProps {
  extraClasses?: string;
  locale: string;
  slug: string;
  initialData?: any;
  title?: string;
  sidebarHeader?: ReactElement;
}

function StaticPage({
  extraClasses = "",
  locale,
  slug,
  initialData = undefined,
  title = "MDN",
  sidebarHeader = <></>,
}: StaticPageProps) {
  const baseURL = `/${locale.toLowerCase()}/${slug}`;
  const featureJSONUrl = `${baseURL}/index.json`;
  const { data: { hyData } = {}, error } = useSWR<any>(
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
      initialData,
      revalidateOnFocus: CRUD_MODE,
    }
  );
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  React.useEffect(() => {
    document.title = hyData ? `${hyData.title} | ${title}` : title;
  }, [hyData, title]);

  if (error) {
    return <PageNotFound />;
  } else if (!hyData) {
    return <Loading />;
  }

  return (
    <div className={`document-page container ${extraClasses}`}>
      <div className="article-wrapper">
        <nav id="sidebar-quicklinks" className="sidebar">
          {sidebarHeader || null}
        </nav>
        <div className="toc">
          {(hyData.toc?.length && <TOC toc={hyData.toc} />) || null}
        </div>
        <main id="content">
          <article className="main-page-content">
            {hyData.sections.map((section) => (
              <section dangerouslySetInnerHTML={{ __html: section }}></section>
            ))}
          </article>
        </main>
      </div>
    </div>
  );
}

export default StaticPage;
