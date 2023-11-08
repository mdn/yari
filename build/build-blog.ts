#!/usr/bin/env node
import {
  buildAuthors,
  buildBlogFeed,
  buildBlogIndex,
  buildBlogPosts,
} from "./blog.js";

await buildBlogIndex({ verbose: true });
await buildBlogPosts({ verbose: true });
await buildAuthors({ verbose: true });
await buildBlogFeed({ verbose: true });
