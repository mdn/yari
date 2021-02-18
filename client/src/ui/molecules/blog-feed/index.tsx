import "./index.scss";

import { FeedEntry } from "../../../homepage/types";

export function BlogFeed({ feedEntries }: { feedEntries?: FeedEntry[] }) {
  return (
    <div className="blog-feed">
      <h2>Hacks Blog</h2>
      <p>
        <a href="http://hacks.mozilla.org/" className="blog-link">
          Read more at hacks.mozilla.org
        </a>
      </p>

      {feedEntries ? (
        <ul>
          {feedEntries.map((feedEntry) => {
            return (
              <li key={feedEntry.url} className="readable-line-length">
                <h3>
                  <a href={feedEntry.url}>{feedEntry.title}</a>
                </h3>
                <p>{feedEntry.summary}</p>
                <p className="post-meta">
                  Posted {feedEntry.pubDate} by {feedEntry.creator}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No feed entries at the moment.</p>
      )}
    </div>
  );
}
