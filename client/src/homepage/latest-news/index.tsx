// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs'. Did you mean to set th... Remove this comment to see the full error message
import dayjs from "dayjs";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'dayjs/plugin/relativeTime'. Di... Remove this comment to see the full error message
import relativeTime from "dayjs/plugin/relativeTime";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'swr'. Did you mean to set the ... Remove this comment to see the full error message
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { HydrationData } from "../../types/hydration";

import "./index.scss";

dayjs.extend(relativeTime);

interface NewsItem {
  url: string;
  title: string;
  source: {
    name: string;
    url: string;
  };
  published_at: string;
}

export function LatestNews(props: HydrationData<any>) {
  const fallbackData = props.hyData ? props : undefined;

  // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
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
      fallbackData,
      revalidateOnFocus: CRUD_MODE,
      revalidateOnMount: !fallbackData,
    }
  );

  const newsItems: NewsItem[] = hyData?.latestNews?.items.slice(0, 3) ?? [];

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
            <span className="news-date">
              <NewsItemDate newsItem={newsItem} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
