import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { useCSRFMiddlewareToken } from "../../../hooks";

import { Icon } from "../../atoms/icon";

type WatchMenuButton = {
  value: string;
  status: boolean;
  label: string;
  text?: string;
  onClickHandler?: (event: React.MouseEvent<Element>) => void;
};

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

  function WatchMenuButton({
    value,
    onClickHandler,
    status,
    label,
    text,
  }: WatchMenuButton) {
    return (
      <button
        role="menuitemradio"
        aria-checked={watchMode === value}
        className="watch-submenu-button"
        value={value}
        disabled={!path || !title}
        onClick={onClickHandler}
      >
        <span className="watch-submenu-button-wrap">
          {status && (
            <span className="watch-submenu-button-status">
              <Icon name="checkmark" />
            </span>
          )}

          <span className="watch-submenu-button-label">{label}</span>
          {text && <span className="watch-submenu-button-text">{text}</span>}
        </span>
      </button>
    );
  }

  return (
    <form
      className="watch-menu-form"
      action={apiURL}
      method="POST"
      onSubmit={handleWatchSelection}
    >
      <div className="watch-submenu-header">Notifications</div>

      <WatchMenuButton
        value="major"
        label="Major updates"
        text="Only receive notifications of major browser compatability releases and revisions to this article."
        status={watchMode === "major"}
        onClickHandler={handleSelection}
      />

      <WatchMenuButton
        value="custom"
        label="Custom"
        text="Select which events you would like to be notified of."
        status={watchMode === "custom"}
        onClickHandler={(event) => {
          event.preventDefault();
          setStepHandler(1);
        }}
      />

      <WatchMenuButton
        value="unwatch"
        label="Unwatch"
        text="Stop receiveing notifications about this article."
        status={watchMode === "unwatch"}
        onClickHandler={handleSelection}
      />
    </form>
  );
}
