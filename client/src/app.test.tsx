import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import { App } from "./app";

it("renders without crashing", () => {
  const app = (
    <MemoryRouter>
      <App url="/" />
    </MemoryRouter>
  );
  const div = document.createElement("div");
  const root = createRoot(div!);
  root.render(app);
  root.unmount();
});
