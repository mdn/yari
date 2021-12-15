import { useState, useEffect } from "react";

import "./index.scss";

const gitHubUrl =
  "https://api.github.com/repos/mdn/content/pulls?state=closed&per_page=10";

function RecentContributions() {
  const [pullRequests, setPullRequestData] = useState<any[]>([]);

  useEffect(() => {
    getGitHubUserWithFetch();
  }, []);

  async function getGitHubUserWithFetch() {
    const response = await fetch(gitHubUrl);
    const jsonData = await response.json();

    setPullRequestData(jsonData);
  }

  return (
    <div className="recent-contributions">
      <span className="mdn-ui-emphasis-l">Recent contributions</span>
      <div className="contribution-list">
        {pullRequests.map((pullRequest) => (
          <div className="request-item">
            <h5 className="request-title">
              <a href={pullRequest.html_url}>{pullRequest.title} </a>
              <span>
                <a
                  className="request-repo"
                  href={pullRequest.base.repo.html_url}
                >
                  mdn/
                  {pullRequest.base.repo.name}
                </a>
              </span>
            </h5>
            <span className="request-date">{pullRequest.updated_at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentContributions;
