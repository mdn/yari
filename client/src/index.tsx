import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { App } from "./app";
import { GAProvider } from "./ga-context";
import { UserDataProvider } from "./user-context";

import "./index.scss";

const WSSProvider = React.lazy(() => import("./web-socket"));
// import * as serviceWorker from './serviceWorker';

const container = document.getElementById("root");
if (!container) {
  throw new Error("missing root element");
}
let docData = null;
const documentDataElement = document.getElementById("documentdata");
if (documentDataElement) {
  docData = JSON.parse(documentDataElement.textContent || "");
}

let app = (
  <GAProvider>
    <UserDataProvider>
      <Router>
        <App doc={docData} />
      </Router>
    </UserDataProvider>
  </GAProvider>
);

if (process.env.NODE_ENV === "development") {
  // We only use a WebSocket to listen for document changes in development
  app = (
    <React.Suspense fallback>
      <WSSProvider>{app}</WSSProvider>
    </React.Suspense>
  );
}

app = <React.StrictMode>{app}</React.StrictMode>;

if (container.firstElementChild) {
  ReactDOM.hydrate(app, container);
} else {
  ReactDOM.render(app, container);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
