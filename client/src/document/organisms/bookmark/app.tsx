import React from "react";
import useSWR, { mutate } from "swr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Doc } from "../../types";

dayjs.extend(relativeTime);

interface BookmarkedData {
  bookmarked: string | null;
  csrfmiddlewaretoken: string;
}
const API_BASE = "/api/v1/plus/bookmarks/";

export default function App({ doc }: { doc: Doc }) {
  const apiURL = `${API_BASE}bookmarked/?${new URLSearchParams({
    url: doc.mdn_url,
  }).toString()}`;
  const { data, error } = useSWR<BookmarkedData>(
    apiURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: true,
    }
  );

  async function saveBookmarked() {
    if (!data) {
      return;
    }
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
  }

  const [toggleError, setToggleError] = React.useState<Error | null>(null);

  if (error) {
    return <span>🚨</span>;
  }

  return (
    <Button
      bookmarked={(data && data.bookmarked) || null}
      loading={!data}
      error={toggleError}
      toggle={async () => {
        try {
          await saveBookmarked();
          if (toggleError) {
            setToggleError(null);
          }
          mutate(apiURL);
          return true;
        } catch (err) {
          setToggleError(err);
          return false;
        }
      }}
    />
  );
}

function Button({
  bookmarked,
  loading,
  toggle,
  error,
}: {
  bookmarked: string | null;
  loading: boolean;
  toggle: () => Promise<boolean>;
  error: Error | null;
}) {
  const style: { [key: string]: string | number } = {
    cursor: "pointer",
    border: "0",
  };

  let title = "Not been bookmarked";
  if (error) {
    title = error.toString();
    style.border = "1px solid red";
  } else if (bookmarked) {
    title = `Bookmarked ${dayjs(bookmarked).fromNow()}`;
    style.color = "orange";
  } else if (loading) {
    title = "Loading";
    style.opacity = 0.5;
  }
  return (
    <button style={style} title={title} onClick={toggle}>
      {error ? "🙀" : !bookmarked || loading ? "☆" : "★"}
    </button>
  );
}
