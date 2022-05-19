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

function RecentContributions(props: HydrationData<any>) {
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

  return hyData?.recentContributions ? (
    <section className="recent-contributions">
      <h2>Recent contributions</h2>
      <ul className="contribution-list">
        {hyData.recentContributions.items.map(
          ({ number, url, title, updated_at }) => (
            <li className="request-item" key={number}>
              <p className="request-title">
                <a href={url}>{title}</a>
                <span>
                  <a
                    className="request-repo"
                    href={hyData.recentContributions.repo.url}
                  >
                    {hyData.recentContributions.repo.name}
                  </a>
                </span>
              </p>
              <span className="request-date">
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
