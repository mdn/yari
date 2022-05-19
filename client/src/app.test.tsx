import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import { App } from "./app";

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
it("renders without crashing", () => {
  const app = (
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const div = document.createElement("div");
  const root = createRoot(div!);
  root.render(app);
  root.unmount();
});
