import { createRoot } from "react-dom/client";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
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
