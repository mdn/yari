import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app";

it("renders without crashing", () => {
  const app = <App />;
  const div = document.createElement("div");
  ReactDOM.render(app, div);
  ReactDOM.unmountComponentAtNode(div);
});
