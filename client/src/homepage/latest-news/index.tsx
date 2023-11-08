import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";
import { DEV_MODE } from "../../env";
import {
  HydrationData,
  StaticPageData,
} from "../../../../libs/types/hydration";
import { NewsItem } from "../../../../libs/types/document";

import "./index.scss";

dayjs.extend(relativeTime);

export function LatestNews(props: HydrationData) {
  const fallbackData = props.hyData ? props : undefined;

  const { data: { hyData } = {} } = useSWR<HydrationData>(
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
      fallbackData,
      revalidateOnFocus: DEV_MODE,
      revalidateOnMount: !fallbackData,
    }
  );

  const newsItems: NewsItem[] =
    (hyData as StaticPageData)?.latestNews?.items.slice(0, 3) ?? [];

  if (!newsItems.length) {
    return null;
  }

  function NewsItemTitle({ newsItem }: { newsItem: NewsItem }) {
    const ageInDays = dayjs().diff(newsItem.published_at, "day");
    const isNew = ageInDays < 7;

    return (
      <>
        <a href={newsItem.url}>{newsItem.title}</a>
        {isNew && (
          <>
            {" "}
            <span className="badge">New</span>
          </>
        )}
      </>
    );
  }

  function NewsItemSource({ newsItem }: { newsItem: NewsItem }) {
    const { source } = newsItem;

    return (
      <a className="news-source" href={source.url}>
        {source.name}
      </a>
    );
  }

  function NewsItemDate({ newsItem }: { newsItem: NewsItem }) {
    const relativeTime = dayjs(newsItem.published_at).fromNow();

    return <>{relativeTime}</>;
  }

  return (
    <section className="latest-news">
      <h2>Latest news</h2>
      <ul className="news-list">
        {newsItems.map((newsItem) => (
          <li className="news-item" key={newsItem.url}>
            <p className="news-title">
              <span>
                <NewsItemTitle newsItem={newsItem} />
              </span>
              <span>
                <NewsItemSource newsItem={newsItem} />
              </span>
            </p>
            <span className="news-date" suppressHydrationWarning>
              <NewsItemDate newsItem={newsItem} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
