import { Doc } from "./document.js";

export enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}

export interface ModuleIndexEntry {
  url: string;
  title: string;
  slug: string;
  summary?: string;
  topic?: Topic;
  children?: ModuleIndexEntry[];
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
