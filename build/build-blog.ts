import { buildBlogFeed, buildBlogIndex, buildBlogPosts } from "./blog.js";

await buildBlogIndex({ verbose: true });
await buildBlogPosts({ verbose: true });
await buildBlogFeed({ verbose: true });
