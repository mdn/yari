import { BlogPostMetadata } from "./blog.js";

interface HydrationData<T = any> {
  hyData?: T;
  blogMeta?: BlogPostMetadata | null;
  pageTitle?: string;
  image?: string | null;
}

export type { HydrationData };
