import React from "react";

import { Button } from "../../atoms/button";
import { NotificationsWatchMenuStart } from "./menu-start";

import "./index.scss";
import useSWR from "swr";
import { useCSRFMiddlewareToken, useOnlineStatus } from "../../../hooks";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";
import { ManageOrUpgradeDialogNotifications } from "../manage-upgrade-dialog";
import { useUIStatus } from "../../../ui-context";

interface WatchModeData {
  status: string;
  subscription_limit_reached: boolean;
}

export const NotificationsWatchMenu = ({ doc }) => {
  const compat = doc.body.find((e) => e.type === "browser_compatibility");
  const path = compat ? compat.value?.query : doc.mdn_url;
  const title = doc.title;

  const menuId = "watch-submenu";
  const [show, setShow] = React.useState(false);
  const closeDropdown = () => setShow(false);

  const slug = doc.mdn_url; // Unique ID for the page
  const apiURL = `/api/v1/plus/watching/?url=${slug}`;
  const csrfMiddlewareToken = useCSRFMiddlewareToken();
  const ui = useUIStatus();
  const { isOffline } = useOnlineStatus();

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
  const canWatchMore = !Boolean(data?.subscription_limit_reached);

  async function handleWatchSubmit({ unwatch }: { unwatch?: boolean }) {
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
    } = {
      path,
      title,
      unwatch,
    };

    const response = await fetch(apiURL, {
      method: "POST",
      body: JSON.stringify(postData),
      headers: {
        "X-CSRFToken": csrfMiddlewareToken || "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const json = await response.json();
      if (json?.error === "max_subscriptions") {
        ui.setToastData({
          mainText: "Couldn't watch article - Max subscriptions reached!",
          isImportant: false,
        });
        return;
      }

      throw new Error(`${response.status} on ${slug}`);
    }
    await mutate();
    return true;
  }

  const watchIcon = watching ? "eye-filled" : canWatchMore ? "eye" : "padlock";
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
          isDisabled={isOffline}
          icon={watchIcon}
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
      {!canWatchMore && !watching ? (
        <DropdownMenu>
          <ManageOrUpgradeDialogNotifications setShow={setShow} />
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <div
            className={`${menuId} show`}
            role="menu"
            aria-labelledby={`${menuId}-button`}
          >
            <NotificationsWatchMenuStart
              closeDropdown={closeDropdown}
              data={data}
              handleSelection={(unwatch: boolean) => {
                if (!watching || unwatch) {
                  handleWatchSubmit({ unwatch });
                }
              }}
            />
          </div>
        </DropdownMenu>
      )}
    </DropdownMenuWrapper>
  );
};
