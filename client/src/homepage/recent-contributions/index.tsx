import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";
import { DEV_MODE } from "../../env";
import { HydrationData, isStaticPageData } from "../../types/hydration";

import "./index.scss";

dayjs.extend(relativeTime);

function RecentContributions(props: HydrationData) {
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

  return isStaticPageData(hyData, "recentContributions") ? (
    <section className="recent-contributions">
      <h2>Recent contributions</h2>
      <ul className="contribution-list">
        {hyData.recentContributions.items.map(
          ({ number, url, title, updated_at, repo }) => (
            <li className="request-item" key={number}>
              <p className="request-title">
                <a href={url}>{title}</a>
                <span>
                  <a className="request-repo" href={repo.url}>
                    {repo.name}
                  </a>
                </span>
              </p>
              <span className="request-date" suppressHydrationWarning>
                {dayjs(updated_at).fromNow()}
              </span>
            </li>
          )
        )}
      </ul>
    </section>
  ) : null;
}

export default RecentContributions;
