import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import { App } from "./app";
import { GAProvider } from "./ga-context";
import { UserDataProvider } from "./user-context";

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
const feedEntries = (window as any).__feedEntries__;
const possibleLocales = (window as any).__possibleLocales__;

let app = (
  <GAProvider>
    <UserDataProvider>
      <Router>
        <App
          doc={docData}
          pageNotFound={pageNotFound}
          feedEntries={feedEntries}
          possibleLocales={possibleLocales}
        />
      </Router>
    </UserDataProvider>
  </GAProvider>
);

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
