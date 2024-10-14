#!/usr/bin/env node
import {
  buildAuthors,
  buildBlogFeed,
  buildBlogIndex,
  buildBlogPosts,
  buildBlogSitemap,
} from "./blog.js";

await buildBlogIndex({ verbose: true });
await buildBlogPosts({ verbose: true });
await buildAuthors({ verbose: true });
await buildBlogFeed({ verbose: true });
await buildBlogSitemap({ verbose: true });
