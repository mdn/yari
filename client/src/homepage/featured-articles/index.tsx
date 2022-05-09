import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { HydrationData } from "../../types/hydration";

import "./index.scss";

export default function FeaturedArticles(props: HydrationData<any>) {
  const { data: { hyData } = {} } = useSWR<any>(
    "./index.json",
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

  return hyData?.featuredArticles.length ? (
    <div className="featured-articles">
      <h2>Featured Articles</h2>
      <div className="tile-container">
        {hyData.featuredArticles.map((article) => {
          return (
            <div className="article-tile" key={article.mdn_url}>
              {article.tag && (
                <a href={article.tag.uri} className="tile-tag">
                  {article.tag.title}
                </a>
              )}
              <h3 className="tile-title">
                <a href={article.mdn_url}>{article.title}</a>
              </h3>
              <p>{article.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
}
