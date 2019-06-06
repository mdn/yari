import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

it("renders without crashing", () => {
  const app = (
    <BrowserRouter>
      {/* <App document={documentData} /> */}
      <App />
    </BrowserRouter>
  );
  const div = document.createElement("div");
  ReactDOM.render(app, div);
  ReactDOM.unmountComponentAtNode(div);
});
