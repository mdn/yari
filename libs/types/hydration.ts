import { BlogPostMetadata } from "./blog.js";

interface HydrationData<T = any, S = any> {
  hyData?: T;
  doc?: S;
  blogMeta?: BlogPostMetadata | null;
  pageTitle?: string;
  image?: string | null;
}

export type { HydrationData };
