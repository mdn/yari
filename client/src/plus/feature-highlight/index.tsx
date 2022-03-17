import React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { TOC } from "../../document/organisms/toc";
import { Button } from "../../ui/atoms/button";
import "./index.scss";

function FeatureHighlight(props) {
  const { feature, locale } = useParams();

  const baseURL = `/${locale.toLowerCase()}/plus/feature/${feature}`;
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
      initialData: props.hyData ? props : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  React.useEffect(() => {
    const pageTitle = hyData && `${hyData.title} | MDN Plus`;
    document.title = pageTitle;
  }, [hyData]);

  console.log(props);
  if (!hyData) {
    return <>NaN</>;
  }
  return (
    <div className="feature-highlight container">
      <div className="ft-sidebar">
        <Button href={`/${locale}/plus`}>← Back to Overview</Button>
        {(hyData.toc?.length && <TOC toc={hyData.toc}></TOC>) || null}
      </div>
      <article className="ft-content">
        {hyData.sections.map((section) => (
          <section dangerouslySetInnerHTML={{ __html: section }}></section>
        ))}
      </article>
    </div>
  );
}

export default FeatureHighlight;
