import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Loading } from "../../ui/atoms/loading";
import { useUserData } from "../../user-context";
import { useLocale } from "../../hooks";
import "./index.scss";

dayjs.extend(relativeTime);

interface Bookmark {
  id: number;
  url: string;
  title: string;
  created: string;
}

interface BookmarksData {
  items: Bookmark[];
  count: number;
}

export default function Bookmarks() {
  const userData = useUserData();

  const pageTitle = "Your bookmarks";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);

  const { data, error } = useSWR<BookmarksData | null, Error | null>(
    userData && userData.isAuthenticated && userData.isSubscriber
      ? "/api/v1/plus/bookmarks/"
      : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      const data = (await response.json()) as BookmarksData;
      return data;
    }
  );

  if (!userData) {
    return <Loading message="Waiting for authentication" />;
  } else if (!userData.isAuthenticated) {
    return <NotSignedIn />;
  } else if (!userData.isSubscriber) {
    return <NotSubscriber />;
  }

  if (error) {
    return <DataError error={error} />;
  } else if (!data) {
    return <Loading message="Waiting for data" />;
  }
  return <DisplayData data={data} />;
}

function DisplayData({ data }: { data: BookmarksData }) {
  return (
    <section>
      <h3>Your bookmarks ({data.count.toLocaleString()})</h3>

      {data.count === 0 && (
        <p className="nothing-bookmarked">
          Nothing bookmarked yet. Go out there an explore!
        </p>
      )}

      {data.items.map((bookmark) => {
        const created = dayjs(bookmark.created);
        return (
          <div key={bookmark.id} className="bookmark">
            <h4>
              <a href={bookmark.url}>{bookmark.title}</a>
            </h4>
            <p className="breadcrumb">
              <a href={bookmark.url}>{bookmark.url}</a>
            </p>
            <p>
              <small>{created.fromNow()}</small>
            </p>
          </div>
        );
      })}
    </section>
  );
}

function DataError({ error }: { error: Error }) {
  return (
    <div className="notecard negative">
      <h3>Server error</h3>
      <p>A server error occurred trying to get your bookmarks.</p>
      <p>
        <code>{error.toString()}</code>
      </p>
      <a href={window.location.pathname}>Reload this page and try again.</a>
    </div>
  );
}

function NotSignedIn() {
  const locale = useLocale();
  const sp = new URLSearchParams();
  sp.set("next", window.location.pathname);

  return (
    <>
      <h2>You have not signed in</h2>
      <Link to={`/${locale}/signin?${sp.toString()}`}>
        Please sign in to continue
      </Link>
    </>
  );
}

function NotSubscriber() {
  const locale = useLocale();
  return (
    <>
      <h2>You are signed in but not an active subscriber</h2>
      <Link to={`/${locale}/plus`}>Go to the MDN Plus home page</Link>
    </>
  );
}
