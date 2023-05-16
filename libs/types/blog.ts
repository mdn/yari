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

export interface BlogPostFrontmatter {
  slug: string;
  title: string;
  description: string;
  image: BlogImage;
  keywords: string[];
  sponsored?: boolean;
  published?: boolean;
  date: string;
  author?: Author;
  readTime?: number;
}

export interface BlogPostData {
  doc: Doc;
  blogMeta: BlogPostFrontmatter;
}
