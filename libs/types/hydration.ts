import { BlogPostMetadata } from "./blog.js";
import { CurriculumMetaData } from "./curriculum.js";

interface HydrationData<T = any, S = any> {
  hyData?: T;
  doc?: S;
  blogMeta?: BlogPostMetadata | null;
  curriculumMeta?: CurriculumMetaData | null;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
  image?: string | null;
}

export type { HydrationData };
