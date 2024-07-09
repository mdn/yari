import { type Locale } from "./core.js";
import { BuildData, Doc, DocParent } from "./document.js";

export enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}

export enum Template {
  Module = "module",
  Overview = "overview",
  Landing = "landing",
  About = "about",
  Default = "default",
}

export interface CurriculumCoreMetaData {
  url: string;
  title: string;
}

export interface CurriculumIndexEntry extends CurriculumCoreMetaData {
  slug?: string;
  summary?: string;
  topic?: Topic;
  children?: CurriculumIndexEntry[];
}

export interface PrevNext {
  next?: CurriculumIndexEntry;
  prev?: CurriculumIndexEntry;
}

export interface CurriculumFrontmatter {
  summary?: string;
  template?: Template;
  topic?: Topic;
}

export interface CurriculumMetaData
  extends CurriculumFrontmatter,
    CurriculumCoreMetaData {
  filename: string;
  slug: string;
  sidebar: CurriculumIndexEntry[];
  modules: CurriculumIndexEntry[];
  parents: DocParent[];
  prevNext?: PrevNext;
  group?: string;
}

export interface CurriculumDoc extends Doc {
  sidebar?: CurriculumIndexEntry[];
  modules?: CurriculumIndexEntry[];
  prevNext?: PrevNext;
  topic?: Topic;
  group?: string;
  template: Template;
}

export interface CurriculumData {
  doc?: CurriculumDoc;
}

export interface ReadCurriculum {
  meta: CurriculumMetaData;
  body: string;
}

export interface CurriculumBuildData extends BuildData {
  metadata: { locale: Locale } & CurriculumMetaData;
}
