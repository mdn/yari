import { Doc } from "./document.js";

export enum Topic {}

export interface SidebarEntry {
  url: string;
  title: string;
  slug: string;
  children?: SidebarEntry[];
}

export interface CurriculumFrontmatter {
  summary?: string;
  icon?: string;
  topic?: Topic;
}

export interface ModuleMetaData extends CurriculumFrontmatter {
  url: string;
  filename: string;
  slug: string;
  title: string;
}

export interface ModuleData {
  doc: Doc;
  curriculumMeta: ModuleMetaData;
}
