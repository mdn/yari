import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { HydrationData } from "../../types/hydration";

import "./index.scss";

dayjs.extend(relativeTime);

function RecentContributions(props: HydrationData<any>) {
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

  return (
    <section className="recent-contributions">
      <h2>Recent contributions</h2>
      <ul className="contribution-list">
        {hyData &&
          hyData.pullRequestsData.items.map((pullRequest) => (
            <li className="request-item" key={pullRequest.number}>
              <p className="request-title">
                <a href={pullRequest.pull_request.html_url}>
                  {pullRequest.title}{" "}
                </a>
                <span>
                  <a
                    className="request-repo"
                    href={hyData.pullRequestsData.repo.url}
                  >
                    {hyData.pullRequestsData.repo.name}
                  </a>
                </span>
              </p>
              <span className="request-date">
                {dayjs(pullRequest.updated_at).fromNow()}
              </span>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default RecentContributions;
