import React from "react";

import { Button } from "../../atoms/button";
import { NotificationsWatchMenuCustom } from "./custom";
import { NotificationsWatchMenuStart } from "./start";

import "./index.scss";
import { useOnClickOutside } from "../../../hooks";
import useSWR from "swr";
import { useCSRFMiddlewareToken } from "../../../hooks";

interface WatchModeData {
  status: string;
}

export const NotificationsWatchMenu = ({ doc }) => {
  const menuId = "watch-submenu";
  const [show, setShow] = React.useState(false);
  const [visibleStep, setVisibleStep] = React.useState<number>(0);
  const slug = doc.mdn_url; // Unique ID for the page
  const compat = doc.body.filter((e) => e.type === "browser_compatibility");
  const path = compat.length > 0 ? compat[0].value?.query : null;
  const title = doc.title;
  const apiURL = `/api/v1/plus/watch${slug}/`;
  const csrfMiddlewareToken = useCSRFMiddlewareToken();

  const { data, mutate } = useSWR<WatchModeData>(
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
  const watching = data?.status && data.status !== "unwatched";

  const submenuRef = React.useRef(null);
  useOnClickOutside(submenuRef, () => setShow(false));

  async function handleWatchSubmit({
    custom,
    unwatch,
  }: {
    custom?: {};
    unwatch?: boolean;
  }) {
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

    let postData = {
      path,
      title,
      unwatch,
    };
    if (custom) {
      postData = { ...postData, ...custom };
    }

    const response = await fetch(apiURL, {
      method: "POST",
      body: JSON.stringify(postData),
      headers: {
        "X-CSRFToken": csrfMiddlewareToken || "",
        "Content-Type": "text/plain", // This has to be "text/plain" cause otherwise django won't accept the request
      },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`${response.status} on ${slug}`);
    }
    await mutate();
    return true;
  }

  return (
    <div className="watch-menu" ref={submenuRef}>
      <React.Suspense fallback={null}>
        <Button
          type="action"
          id="watch-menu-button"
          icon={watching ? "eye-filled" : "eye"}
          extraClasses={`small watch-menu ${watching ? "highlight" : ""}`}
          ariaHasPopup={"menu"}
          aria-label="Watch this page for updates"
          ariaExpanded={show}
          onClickHandler={() => {
            if (show || data) setShow(!show);
          }}
        >
          {watching ? "Watching" : "Watch"}
        </Button>
      </React.Suspense>

      {data && (
        <div
          className={`${menuId} ${show ? "show" : ""}`}
          role="menu"
          aria-labelledby={`${menuId}-button`}
        >
          {visibleStep === 0 ? (
            <NotificationsWatchMenuStart
              data={data}
              setStepHandler={setVisibleStep}
              handleSelection={(unwatch: boolean) => {
                handleWatchSubmit({ unwatch });
              }}
            />
          ) : (
            <NotificationsWatchMenuCustom
              data={data}
              setStepHandler={setVisibleStep}
              handleSelection={(custom) => {
                handleWatchSubmit({ custom });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
