/**
 * Needs a doc string.
 */
import React, { useState, useEffect } from "react";
import Sockette from "sockette";
import { Link } from "@reach/router";

import "./document-spy.css";

export function DocumentSpy({ location, fetchDocument }) {
  // null - never connected before
  // true - connected
  // false - no longer connected
  const [connected, setConnected] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [websocketError, setWebsocketError] = useState(null);

  // XXX At the moment, the `new Sockette()` thing happens every time
  // the location changes. It would be better to use a ref to maintain
  // one and the same Sockette instance open the WHOLE time independent
  // of *which* document you're viewing.
  // This component needs to be a child of the <Document/> component
  // because of the access to `fetchDocument()`. But as you hop from
  // one document to another, it would be nice to not have to destroy
  // and reconnect the Sockette instance.
  useEffect(() => {
    let mounted = true;
    const wss = new Sockette("ws://localhost:8080", {
      timeout: 5e3,
      maxAttempts: 25,
      onopen: e => {
        if (mounted) setConnected(true);
      },
      onmessage: e => {
        const data = JSON.parse(e.data);
        if (data.documentUri === location.pathname) {
          // The recently edited document is the one we're currently
          // looking at!
          if (mounted) fetchDocument(false);
        }
        if (mounted) setLastMessage(data);
      },
      onreconnect: e => {},
      onmaximum: e => {},
      onclose: e => {
        if (mounted) setConnected(false);
      },
      onerror: e => {
        if (mounted) setWebsocketError(e);
      }
    });
    return () => {
      mounted = false;
      wss.close();
    };
  }, [location.pathname, fetchDocument]);

  if (connected === null) {
    return null;
  }

  return (
    <div
      id="document-spy"
      className={connected ? "ws-connected" : "ws-not-connected"}
    >
      {websocketError ? (
        <span title={websocketError.toString()}>WebSocket error!</span>
      ) : (
        <span>
          Document Spy {connected ? "connected 👀" : "not connected 👎🏽"}
        </span>
      )}{" "}
      {lastMessage && <ShowLastMessage {...lastMessage} />}
    </div>
  );
}

function ShowLastMessage({ hasEDITOR, documentUri, changedFile }) {
  function clickToOpenHandler(event) {
    event.preventDefault();
    console.log(`Going to try to open ${changedFile.path} in your editor`);
    fetch(`/_open?filepath=${changedFile.path}`);
  }
  return (
    <span>
      Last changed URL <Link to={documentUri}>{documentUri}</Link>{" "}
      {hasEDITOR && (
        <Link to={documentUri} onClick={clickToOpenHandler}>
          <b>Open in your editor</b>
        </Link>
      )}
    </span>
  );
}
