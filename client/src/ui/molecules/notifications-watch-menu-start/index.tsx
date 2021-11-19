import React, { useState } from "react";
import useSWR, { mutate } from "swr";
interface WatchModeData {
  modeType: string;
  csrfmiddlewaretoken: string;
}

export function NotificationsWatchMenuStart({ setStepHandler }) {
  const [watchMode, setWatchMode] = useState<string>("major");

  const setWatchAPIEndpoint = "/api/v1/plus/watch/set-watch/";
  const apiPostURL = `${setWatchAPIEndpoint}${watchMode}`;
  const slug = "page-slug"; // Unique ID for the page

  // Get existing Watch Mode
  // TODO: Is pathname correct here?
  // Returns "major", "custom", or "unwatch"
  const apiURL = `/api/v1/plus/watch/get-mode/${slug}`;
  const { data, error } = useSWR<WatchModeData>(
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

    const response = await fetch(apiPostURL, {
      method: "POST",
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
    await mutate(apiURL);
    return true;
  }

  return (
    <form
      action={setWatchAPIEndpoint}
      method="POST"
      onSubmit={handleWatchSelection}
    >
      <div className="watch-submenu-header">Notifications</div>

      <button
        role="menuitemradio"
        aria-checked="false"
        className="watch-menu-button"
        value="major"
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
        aria-checked="true"
        aria-haspopup="true"
        className="watch-menu-button"
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
        aria-checked="false"
        className="watch-menu-button"
        value="unwatch"
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
