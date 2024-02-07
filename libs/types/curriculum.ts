import { Doc, DocParent } from "./document.js";

export enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}

export enum Template {
  module = "module",
  overview = "overview",
  landing = "landing",
  about = "about",
}

export interface ModuleIndexEntry {
  url: string;
  title: string;
  slug: string;
  summary?: string;
  topic?: Topic;
  children?: ModuleIndexEntry[];
}

export interface PrevNext {
  next?: ModuleIndexEntry;
  prev?: ModuleIndexEntry;
}

export interface CurriculumFrontmatter {
  summary?: string;
  template?: Template;
  topic?: Topic;
}

export interface ModuleMetaData extends CurriculumFrontmatter {
  url: string;
  filename: string;
  slug: string;
  title: string;
  sidebar: ModuleIndexEntry[];
  modules: ModuleIndexEntry[];
  parents: DocParent[];
  prevNext?: PrevNext;
}

export interface CurriculumDoc extends Doc {
  sidebar?: ModuleIndexEntry[];
  modules?: ModuleIndexEntry[];
  prevNext?: PrevNext;
  topic?: Topic;
}

export interface CurriculumData {
  doc: CurriculumDoc;
}

export interface ReadCurriculum {
  meta: ModuleMetaData;
  body: string;
}

export interface BuildData {
  url: string;
  rawBody: string;
  metadata: { locale: string } & ModuleMetaData;
  isMarkdown: true;
  fileInfo: {
    path: string;
  };
}
