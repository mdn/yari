import React from "react";
import useSWR, { mutate } from "swr";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Button } from "../../atoms/button";

import { Doc } from "../../../document/types";

dayjs.extend(relativeTime);

interface Bookmarked {
  id: number;
  created: string;
}

interface BookmarkedData {
  bookmarked: Bookmarked | null;
  offline?: Boolean;
  csrfmiddlewaretoken: string;
}

export default function App({ doc }: { doc: Doc }) {
  const apiURL = `/api/v1/plus/bookmarks/?${new URLSearchParams({
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
    if (!data || data.offline) {
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

  const [hideLoadingError, setHideLoadingError] = React.useState(false);

  const [toggleError, setToggleError] = React.useState<Error | null>(null);

  // This is an optimization. When you view this page for the very first time
  // there is no way of knowing if the user has previously bookmarked it. All
  // you can do is patiently wait for the XHR to come in.
  // If this local state is NOT undefined, we can use it while waiting for
  // the data from the XHR request.
  const [localBookmarked, setLocalBookmarked] =
    React.useState<Bookmarked | null>(null);

  React.useEffect(() => {
    if (data && !data.offline && !error) {
      setLocalBookmarked(data.bookmarked as Bookmarked);
    }
  }, [data, error]);

  const [isSaving, setSaving] = React.useState(false);

  const offline = data?.offline || false;

  return (
    <>
      {error && !hideLoadingError ? (
        <ShowLoadingError
          error={error}
          clear={() => {
            setHideLoadingError(true);
          }}
        />
      ) : (
        toggleError && (
          <ShowToggleError
            error={toggleError}
            clear={() => {
              setToggleError(null);
            }}
          />
        )
      )}
      <Button
        type="action"
        icon={`${localBookmarked ? "bookmark-filled" : "bookmark"}`}
        extraClasses={`bookmark-button small ${
          localBookmarked ? "highlight" : ""
        }`}
        isDisabled={Boolean(isSaving || offline)}
        onClickHandler={async () => {
          // The first thing we do when the user has toggled it is to store it
          // in local state so that the UI feels responsive.
          // Once this is done, we can take care of sending the local state to
          // the server.
          setLocalBookmarked((before) =>
            before ? null : { created: new Date().toString(), id: 0 }
          );

          // Ultra-basic throttle to prevent multiple calls to saveBookmarked()
          setSaving(true);
          try {
            await saveBookmarked();
            if (toggleError) {
              setToggleError(null);
            }
            mutate(apiURL);
            return true;
          } catch (err: any) {
            setToggleError(err);
            return false;
          } finally {
            setSaving(false);
          }
        }}
      >
        <span className="bookmark-button-label">
          {localBookmarked ? "Saved" : "Save"}
        </span>
      </Button>
    </>
  );
}

function ShowToggleError({
  error,
  clear,
}: {
  error: Error;
  clear: () => void;
}) {
  return (
    <div className="notification error">
      <button type="button" onClick={() => clear()}>
        X
      </button>
      <p>
        <b>Bookmark toggle error</b>
      </p>
      <p>
        <code>{error.toString()}</code>
      </p>
    </div>
  );
}

function ShowLoadingError({
  error,
  clear,
}: {
  error: Error;
  clear: () => void;
}) {
  return (
    <div className="notification error">
      <button type="button" onClick={() => clear()}>
        X
      </button>
      <p>
        <b>Bookmark loading error</b>
      </p>
      <p>
        <code>{error.toString()}</code>
      </p>
    </div>
  );
}
