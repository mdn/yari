import * as React from "react";

import { BlogFeed } from "../ui/molecules/blog-feed";
import { Contribute } from "../ui/molecules/home-contribute";
import { HomeHero } from "../ui/molecules/home-hero";

import "./index.scss";

export function Homepage() {
  return (
    <main id="content" role="main">
      <HomeHero />
      <div className="home-content-container">
        <BlogFeed />
        <Contribute />
      </div>
    </main>
  );
}
