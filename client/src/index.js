import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import "typeface-zilla-slab";
import { App } from "./app";
import touched from "./touchthis";
if (process.env.NODE_ENV === "development") {
  if (touched && touched.length) {
    const e = document.createElement("p");
    e.style["background-color"] = "#dedede";
    e.style["bgColor"] = "orange";
    e.style["position"] = "absolute";
    e.style["top"] = "0px";
    e.style["font-size"] = "70%";
    e.style["margin"] = "0";
    e.style["width"] = "100%";
    e.textContent = "Latest content change: " + touched[0].filePath;
    const a = document.createElement("a");
    a.href = touched[0].uri;
    a.style["padding-left"] = "10px";
    a.textContent = touched[0].uri;
    e.appendChild(a);
    document.body.appendChild(e);
  }
}
// import * as serviceWorker from './serviceWorker';

const container = document.getElementById("root");
let docData = null;
const documentDataElement = document.getElementById("documentdata");
if (documentDataElement) {
  docData = JSON.parse(documentDataElement.text);
}
const app = <App doc={docData} />;
if (container.firstElementChild) {
  ReactDOM.hydrate(app, container);
} else {
  ReactDOM.render(app, container);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
