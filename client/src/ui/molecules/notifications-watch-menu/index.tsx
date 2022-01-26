import React from "react";

import { Button } from "../../atoms/button";
import { NotificationsWatchMenuCustom } from "./menu-custom";
import { NotificationsWatchMenuStart } from "./menu-start";

import "./index.scss";
import useSWR from "swr";
import { useCSRFMiddlewareToken } from "../../../hooks";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

interface WatchModeData {
  status: string;
}

export const NotificationsWatchMenu = ({ doc }) => {
  const compat = doc.body.find((e) => e.type === "browser_compatibility");
  const path = compat ? compat.value?.query : doc.mdn_url;
  const title = doc.title;

  const compatPage = path && compat;

  const menuId = "watch-submenu";
  const [show, setShow] = React.useState(false);
  const [visibleStep, setVisibleStep] = React.useState<number>(0);
  const slug = doc.mdn_url; // Unique ID for the page
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

  async function handleWatchSubmit({
    custom,
    custom_default,
    update_custom_default,
    unwatch,
  }: {
    custom?: { content: boolean; compatibility: string[] };
    custom_default?: boolean;
    update_custom_default?: boolean;
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

    let postData: {
      path: string;
      title: string;
      unwatch?: boolean;
      custom_default?: boolean;
      update_custom_default?: boolean;
      custom?: { content: boolean; compatibility: string[] };
    } = {
      path,
      title,
      unwatch,
      custom_default,
      update_custom_default,
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
      // if (response.error === "max_subscriptions"){
      //   ToDo: Handle Error here
      // }

      throw new Error(`${response.status} on ${slug}`);
    }
    await mutate();
    return true;
  }

  return (
    <DropdownMenuWrapper
      className="watch-menu"
      isOpen={show}
      setIsOpen={setShow}
    >
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
        <DropdownMenu>
          <div
            className={`${menuId} show`}
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
                showCustom={compatPage}
              />
            ) : (
              <NotificationsWatchMenuCustom
                data={data}
                setStepHandler={setVisibleStep}
                handleSelection={(
                  custom: {
                    content: boolean;
                    compatibility: string[];
                  },
                  custom_default,
                  update_custom_default
                ) => {
                  if (custom.content || custom.compatibility.length) {
                    handleWatchSubmit({
                      custom,
                      custom_default,
                      update_custom_default,
                    });
                  } else {
                    handleWatchSubmit({ unwatch: true });
                  }
                }}
              />
            )}
          </div>
        </DropdownMenu>
      )}
    </DropdownMenuWrapper>
  );
};
