import { addParameters, configure } from "@storybook/react";
import { DocsPage, DocsContainer } from "@storybook/addon-docs/blocks";

import "./preview.scss";

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});

const loadStories = () => {
  return [
    // load Docs first
    require.context("../docs", true, /intro.stories.mdx/),
    require.context("../docs", true, /\.stories\.(js|jsx|ts|tsx|mdx)$/),
    require.context("../src", true, /\.stories\.(js|jsx|ts|tsx|mdx)$/)
  ];
};

configure(loadStories(), module);
