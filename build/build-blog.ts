#!/usr/bin/env node
import {
  buildAuthors,
  buildBlogFeed,
  buildBlogIndex,
  buildBlogPosts,
} from "./blog.js";

await Promise.all([
  buildBlogIndex({ verbose: true }),
  buildBlogPosts({ verbose: true }),
]);
await Promise.all([
  buildAuthors({ verbose: true }),
  buildBlogFeed({ verbose: true }),
]);
