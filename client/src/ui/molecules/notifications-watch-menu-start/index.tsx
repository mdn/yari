import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { useCSRFMiddlewareToken } from "../../../hooks";
interface WatchModeData {
  modeType: string;
  csrfmiddlewaretoken: string;
}

export function NotificationsWatchMenuStart({ doc, setStepHandler }) {
  const [watchMode, setWatchMode] = useState<string>("major");
  const csrfMiddlewareToken = useCSRFMiddlewareToken();

  const slug = doc.mdn_url; // Unique ID for the page
  const apiURL = `/api/v1/plus/watch${slug}/`;
  const compat = doc.body.filter((e) => e.type === "browser_compatibility");
  const path = compat.length > 0 ? compat[0].value?.query : null;
  const title = doc.title;

  // Returns "major", "custom", or "unwatch"
  const { data } = useSWR<WatchModeData>(
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

  const handleSelection = (event) => {
    setWatchMode(event.currentTarget.value);
  };

  async function handleWatchSelection(event) {
    event.preventDefault();

    if (!data) {
      return null;
    }

    if (!path || !title) {
      console.log(
        "this page is missing a path or a title from browser compat",
        path,
        title
      );
      console.log(doc);
      return;
    }

    const response = await fetch(apiURL, {
      method: "POST",
      body: JSON.stringify({
        path: path,
        title: title,
      }),
      headers: {
        "X-CSRFToken": csrfMiddlewareToken || "",
        "Content-Type": "text/plain", // This has to be "text/plain" cause otherwise django won't accept the request
      },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`${response.status} on ${slug}`);
    }
    await mutate(apiURL);
    return true;
  }

  return (
    <form action={apiURL} method="POST" onSubmit={handleWatchSelection}>
      <div className="watch-submenu-header">Notifications</div>

      <button
        role="menuitemradio"
        aria-checked={watchMode === "major"}
        className="watch-menu-button"
        value="major"
        disabled={!path || !title}
        onClick={handleSelection}
      >
        <span className="watch-menu-button-wrap">
          <span className="watch-menu-button-status">✅</span>

          <span className="watch-menu-button-label">Major updates</span>
          <span className="watch-menu-button-text">
            Only receive notifications of major browser compatability releases
            and revisions to this article.
          </span>
        </span>
      </button>

      {/*
        !!!
      */}
      <button
        type="button"
        role="menuitemradio"
        aria-checked={watchMode === "custom"}
        aria-haspopup="true"
        className="watch-menu-button"
        disabled={!path || !title}
        onClick={(event) => {
          event.preventDefault();
          setStepHandler(1);
        }}
      >
        <span className="watch-menu-button-wrap">
          <span className="watch-menu-button-status"></span>

          <span className="watch-menu-button-label">Custom</span>
          <span className="watch-menu-button-text">
            Select which events you would like to be notified of.
          </span>
        </span>
      </button>

      <button
        type="submit"
        role="menuitemradio"
        aria-checked={watchMode === "unwatch"}
        className="watch-menu-button"
        value="unwatch"
        disabled={!path || !title}
        onClick={handleSelection}
      >
        <span className="watch-menu-button-wrap">
          <span className="watch-menu-button-status"></span>

          <span className="watch-menu-button-label">Unwatch</span>
          <span className="watch-menu-button-text">
            Stop receiveing notifications about this article.
          </span>
        </span>
      </button>
    </form>
  );
}
