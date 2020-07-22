import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";

import { useDocumentURL } from "../hooks";

import "./watcher.scss";

export default function Watcher({ onDocumentUpdate }) {
  const documentURL = useDocumentURL();

  const { error, data } = useSWR(
    "/_index/changes",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return (await response.json()).changes;
    },
    {
      refreshInterval: 1000,
    }
  );

  const [lastChange] = data || [];

  return (
    <div className="document-watcher">
      {error ? (
        <span title={error.toString()}>Change checker error!</span>
      ) : (
        <span>Watching file system for changes 👀</span>
      )}
      {lastChange && (
        <LastChange hasEditorSet={data.hasEditorSet} change={lastChange} />
      )}
    </div>
  );
}

function LastChange({ hasEditorSet, change }: any) {
  function clickToOpenHandler(event) {
    event.preventDefault();
    console.log(`Going to try to open ${change.filePath} in your editor`);
    fetch(`/_open?filepath=${change.filePath}`);
  }

  if (change.type === "deleted") {
    return <div>Last removed "{change.filePath}"</div>;
  }

  const { url } = change.documentInfo;

  return (
    <div>
      Last {change.type} document at URL:
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
