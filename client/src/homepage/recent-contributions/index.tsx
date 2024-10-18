import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";

import { DEV_MODE } from "../../env";
import { HydrationData } from "../../../../libs/types/hydration";
import { HOMEPAGE, HOMEPAGE_ITEMS } from "../../telemetry/constants";

import "./index.scss";

dayjs.extend(relativeTime);

function RecentContributions(props: HydrationData<any>) {
  const fallbackData = props.hyData ? props : undefined;

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
      revalidateOnFocus: DEV_MODE,
      revalidateOnMount: !fallbackData,
    }
  );

  return hyData?.recentContributions ? (
    <section className="recent-contributions">
      <h2>Recent contributions</h2>
      <ul className="contribution-list">
        {hyData.recentContributions.items.map(
          ({ number, url, title, updated_at, repo }, index) => (
            <li className="request-item" key={number}>
              <p className="request-title">
                <a
                  href={url}
                  data-glean={`${HOMEPAGE}: ${HOMEPAGE_ITEMS.CONTRIBUTION} ${index + 1}`}
                >
                  {title}
                </a>
                <span>
                  <a
                    className="request-repo"
                    href={repo.url}
                    data-glean={`${HOMEPAGE}: ${HOMEPAGE_ITEMS.CONTRIBUTION_REPO} ${index + 1}`}
                  >
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
