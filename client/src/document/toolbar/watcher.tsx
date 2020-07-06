/**
 * Needs a doc string.
 */
import React, { useState, useEffect, useRef } from "react";
import Sockette from "sockette";
import { Link } from "react-router-dom";

import { useDocumentURL } from "../hooks";

import "./watcher.scss";

export default function Watcher({ onDocumentUpdate }) {
  const documentURL = useDocumentURL();
  // null - never connected before
  // true - connected
  // false - no longer connected
  const [connected, setConnected] = useState<boolean | null>(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [websocketError, setWebsocketError] = useState<any>(null);

  const wssRef = useRef<Sockette>();
  useEffect(() => {
    let mounted = true;
    wssRef.current = new Sockette("ws://localhost:8080", {
      timeout: 5e3,
      maxAttempts: 25,
      onopen: (e) => {
        if (mounted) setConnected(true);
      },
      onmessage: (e) => {
        const data = JSON.parse(e.data);
        if (documentURL === data.documentURL) {
          onDocumentUpdate();
        }
        if (mounted) setLastMessage(data);
      },
      onreconnect: (e) => {},
      onmaximum: (e) => {},
      onclose: (e) => {
        if (mounted) setConnected(false);
      },
      onerror: (e) => {
        if (mounted) setWebsocketError(e);
      },
    });
    return () => {
      mounted = false;
      wssRef.current && wssRef.current.close();
    };
  }, [documentURL, onDocumentUpdate]);

  if (connected === null) {
    return <div className="document-watcher" />;
  }

  return (
    <div
      className={`document-watcher ${
        connected ? "ws-connected" : "ws-not-connected"
      }`}
    >
      {websocketError ? (
        <span title={websocketError.toString()}>WebSocket error!</span>
      ) : (
        <span>
          {connected
            ? "Watching file system for changes 👀"
            : "Document watcher is not connected 👎🏽"}
        </span>
      )}{" "}
      {lastMessage && <ShowLastMessage {...lastMessage} />}
    </div>
  );
}

function ShowLastMessage({ hasEDITOR, documentURL, changedFile }: any) {
  function clickToOpenHandler(event) {
    event.preventDefault();
    console.log(`Going to try to open ${changedFile.path} in your editor`);
    fetch(`/_open?filepath=${changedFile.path}`);
  }
  return (
    <div>
      Last changed URL <Link to={documentURL}>{documentURL}</Link>{" "}
      {hasEDITOR && (
        <>
          (
          <Link to={documentURL} onClick={clickToOpenHandler}>
            <b>Open in your editor</b>
          </Link>
          )
        </>
      )}
    </div>
  );
}
