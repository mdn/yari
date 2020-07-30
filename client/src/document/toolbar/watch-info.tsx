import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useWebSocketMessageHandler } from "../../web-socket";

import "./watch-info.scss";

export default function WatchInfo() {
  const [lastChange, setLastChange] = useState<any>(null);

  const { status } = useWebSocketMessageHandler((event) => {
    if (event.type === "DOCUMENT_CHANGE") {
      setLastChange(event);
    }
  });

  return (
    <div className="document-watch-info">
      {
        {
          error: <span>Change checker error!</span>,
          disconnected: (
            <span>
              Watcher is still initializing{" "}
              <span role="img" aria-label="Stopwatch">
                ⏱
              </span>
            </span>
          ),
          connected: (
            <span>
              Watching file system for changes{" "}
              <span role="img" aria-label="Eyes">
                👀
              </span>
            </span>
          ),
        }[status]
      }
      {lastChange && (
        <LastChange
          hasEditorSet={lastChange.hasEditorSet}
          changeEvent={lastChange.change}
        />
      )}
    </div>
  );
}

function LastChange({ hasEditorSet, changeEvent }: any) {
  function clickToOpenHandler(event) {
    event.preventDefault();
    console.log(`Going to try to open ${changeEvent.filePath} in your editor`);
    fetch(`/_open?filepath=${changeEvent.filePath}`);
  }

  if (changeEvent.type === "deleted") {
    return <div>Last removed "{changeEvent.filePath}"</div>;
  }

  const { url } = changeEvent.document;

  return (
    <div>
      Last {changeEvent.type} document at URL:
      <br />
      <Link to={url}>{url}</Link>{" "}
      {hasEditorSet && (
        <>
          (
          <Link to={url} onClick={clickToOpenHandler}>
            <b>Open in your editor</b>
          </Link>
          )
        </>
      )}
    </div>
  );
}
