import React, { ReactElement } from "react";
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { TOC } from "../../document/organisms/toc";
import { PageNotFound } from "../../page-not-found";
import "./index.scss";

interface StaticPageProps {
  locale: string;
  slug: string;
  initialData?: any;
  title?: string;
  sidebarHeader?: ReactElement;
}

function StaticPage({
  locale,
  slug,
  initialData = undefined,
  title = "MDN",
  sidebarHeader = <></>,
}: StaticPageProps) {
  const baseURL = `/${locale.toLowerCase()}/${slug}`;
  const featureJSONUrl = `${baseURL}/index.json`;
  const { data: { hyData } = {} } = useSWR<any>(
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
    const pageTitle = hyData && `${hyData.title} | ${title}`;
    document.title = pageTitle;
  }, [hyData, title]);

  if (!hyData) {
    return <PageNotFound />;
  }

  return (
    <div className="static-page container">
      <div className="static-sidebar">
        {sidebarHeader || null}
        {(hyData.toc?.length && <TOC toc={hyData.toc} />) || null}
      </div>
      <article className="static-content">
        {hyData.sections.map((section) => (
          <section dangerouslySetInnerHTML={{ __html: section }}></section>
        ))}
      </article>
    </div>
  );
}

export default StaticPage;
