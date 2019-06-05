import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.scss";
import "typeface-zilla-slab";
import App from "./App";
// import * as serviceWorker from './serviceWorker';

const container = document.getElementById("root");
let documentData = null;
const documentDataElement = document.getElementById("documentdata");
if (documentDataElement) {
  documentData = JSON.parse(documentDataElement.text);
}
const app = (
  <BrowserRouter>
    <App document={documentData} />
  </BrowserRouter>
);
if (container.firstElementChild) {
  ReactDOM.hydrate(app, container);
} else {
  ReactDOM.render(app, container);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
