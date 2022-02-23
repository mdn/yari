import dayjs from "dayjs";
import useSWR from "swr";
import { CRUD_MODE } from "../../constants";
import { HydrationData } from "../../types/hydration";

import "./index.scss";

function RecentContributions(props: HydrationData<any>) {
  const { data: { data } = {} } = useSWR<any>(
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
      initialData: props.data ? { data: props.data } : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );

  return (
    <section className="recent-contributions">
      <h2 className="mdn-ui-emphasis-l">Recent contributions</h2>
      <ul className="contribution-list">
        {data &&
          data.pullRequestsData.items.map((pullRequest) => (
            <li className="request-item">
              <p className="request-title">
                <a href={pullRequest.pull_request.html_url}>
                  {pullRequest.title}{" "}
                </a>
                <span>
                  <a
                    className="request-repo"
                    href={data.pullRequestsData.repo.url}
                  >
                    {data.pullRequestsData.repo.name}
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
