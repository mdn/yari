import { Doc } from "./document.js";

export interface Author {
  name?: string;
  link?: string;
}

export interface BlogImage {
  file: string;
  alt?: string;
  source?: Author;
  creator?: Author;
}

export interface BlogPostLimitedFrontmatter {
  slug: string;
  title: string;
}

export interface BlogPostFrontmatter extends BlogPostLimitedFrontmatter {
  description: string;
  image: BlogImage;
  keywords: string[];
  sponsored?: boolean;
  published?: boolean;
  date: string;
  author?: Author;
  readTime?: number;
  previous?: BlogPostLimitedFrontmatter;
  next?: BlogPostLimitedFrontmatter;
}

export interface BlogPostData {
  doc: Doc;
  blogMeta: BlogPostFrontmatter;
}
