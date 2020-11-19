import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import { CRUD_MODE } from "./constants";
import { App } from "./app";
import { GAProvider } from "./ga-context";
import { UserDataProvider } from "./user-context";

const WSSProvider = React.lazy(() => import("./web-socket"));
// import * as serviceWorker from './serviceWorker';

const container = document.getElementById("root");
if (!container) {
  throw new Error("missing root element");
}

// The SSR rendering will put
// a `<script>window.__data__ = JSON.parse(...)</script>` into the HTML.
// If it's there, great, if it's not there, this'll be `undefined` the
// components will know to fetch it with XHR.
// TODO: When we have TS types fo `docData` this would become
// something like `(window as any).__data__ as DocData`.
const docData = (window as any).__data__;
const pageNotFound = (window as any).__pageNotFound__;

let app = (
  <GAProvider>
    <UserDataProvider>
      <Router>
        <App doc={docData} pageNotFound={pageNotFound} />
      </Router>
    </UserDataProvider>
  </GAProvider>
);

const isServer = typeof window === "undefined";

// Remember, CRUD_MODE, if not explicitly set, will be that
// of NODE_ENV==='development' which is what you get when you use the
// create-react-app dev server.
// But you might be using CRUD_MODE without create-react-app's dev server,
// and in that case you still need to avoid using React.Suspense because
// that only works in client rendering.
if (!isServer && CRUD_MODE) {
  // We only use a WebSocket to listen for document changes in development
  app = (
    <React.Suspense fallback>
      <WSSProvider>{app}</WSSProvider>
    </React.Suspense>
  );
}

app = <React.StrictMode>{app}</React.StrictMode>;

if (container.firstElementChild) {
  if (window.origin !== "https://translate.googleusercontent.com") {
    ReactDOM.hydrate(app, container);
  }
} else {
  ReactDOM.render(app, container);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
