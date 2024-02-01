import { fdir } from "fdir";
import { BUILD_OUT_ROOT, CURRICULUM_ROOT } from "../libs/env/index.js";
import { Doc, DocParent } from "../libs/types/document.js";
import { DEFAULT_LOCALE } from "../libs/constants/index.js";
import * as kumascript from "../kumascript/index.js";
import LANGUAGES_RAW from "../libs/languages/index.js";
import { syntaxHighlight } from "./syntax-highlight.js";
import {
  injectLoadingLazyAttributes,
  injectNoTranslate,
  makeTOC,
  postLocalFileLinks,
  postProcessCurriculumLinks,
  postProcessExternalLinks,
  postProcessSmallerHeadingIDs,
} from "./utils.js";
import { wrapTables } from "./wrap-tables.js";
import { extractSections } from "./extract-sections.js";
import path from "node:path";
import fs from "node:fs/promises";
import {
  CurriculumFrontmatter,
  ModuleData,
  ModuleMetaData,
  ModuleIndexEntry,
  PrevNext,
  Template,
  CurriculumDoc,
  ReadCurriculum,
  BuildData,
} from "../libs/types/curriculum.js";
import frontmatter from "front-matter";
import { HydrationData } from "../libs/types/hydration.js";
import { memoize, slugToFolder } from "../content/utils.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../ssr/dist/main.js";

export const allFiles = memoize(async () => {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => filePath.endsWith(".md"))
    .crawl(path.join(CURRICULUM_ROOT, "curriculum"));
  return (await api.withPromise()).sort();
});

export const buildIndex = memoize(async () => {
  const files = await allFiles();
  const modules = await Promise.all(
    files.map(
      async (file) =>
        (await readModule(file, { previousNext: false, forIndex: true })).meta
    )
  );
  return modules;
});

export function fileToSlug(file) {
  return file
    .replace(`${CURRICULUM_ROOT}/`, "")
    .replace(/(\d+-|\.md$|\/0?-?README)/g, "");
}

export async function slugToFile(slug) {
  const all = await allFiles();
  const re = new RegExp(
    path.join(
      CURRICULUM_ROOT,
      "curriculum",
      `${slug
        .split("/")
        .map((x) => String.raw`(\d+-)?${x}`)
        .join("/")}.md`
    )
  );
  return all.find((x) => {
    return re.test(x);
  });
}

export async function buildModuleIndex(
  mapper: (x: ModuleMetaData) => Partial<ModuleMetaData> = (x) => x
): Promise<ModuleIndexEntry[]> {
  const index = await buildIndex();

  const s = index.reduce((sidebar, meta) => {
    const currentLvl = meta.slug.split("/").length;
    const last = sidebar.length ? sidebar[sidebar.length - 1] : null;
    const entry = mapper(meta);
    if (currentLvl > 2) {
      if (last) {
        last.children.push(entry);
        return sidebar;
      }
    }

    sidebar.push({ children: [], ...entry });
    return sidebar;
  }, []);

  return s;
}

export async function buildSidebar(): Promise<ModuleIndexEntry[]> {
  const index = await buildModuleIndex(({ url, slug, title }) => {
    return { url, slug, title };
  });

  return index;
}

export async function buildPrevNext(slug: string): Promise<PrevNext> {
  const index = await buildIndex();
  const i = index.findIndex((x) => x.slug === slug);
  return {
    prev: i > 0 ? index[i - 1] : undefined,
    next: i < index.length - 2 ? index[i + 1] : undefined,
  };
}

function breadPath(url: string, cur: ModuleIndexEntry[]): DocParent[] | null {
  for (const entry of cur) {
    if (entry.url === url) {
      return [{ uri: entry.url, title: entry.title }];
    }
    if (entry.children?.length) {
      const found = breadPath(url, entry.children);
      if (found) {
        return [{ uri: entry.url, title: entry.title }, ...found];
      }
    }
  }
  return null;
}

export async function buildParents(url: string): Promise<DocParent[]> {
  const index = await buildModuleIndex(({ url, title }) => {
    return { url, title };
  });
  const parents = breadPath(url, index);
  if (parents) {
    const { url, title } = index[0];
    if (parents[0]?.uri !== url) {
      return [{ uri: url, title }, ...parents];
    }
    return parents;
  }

  return [];
}

async function readModule(
  file: string,
  options?: {
    previousNext?: boolean;
    forIndex?: boolean;
  }
): Promise<ReadCurriculum> {
  const raw = await fs.readFile(file, "utf-8");
  const { attributes, body: rawBody } = frontmatter<CurriculumFrontmatter>(raw);
  const filename = file.replace(CURRICULUM_ROOT, "").replace(/^\/?/, "");
  let title = rawBody.match(/^[\w\n]*#+(.*\n)/)[1]?.trim();
  const body = rawBody.replace(/^[\w\n]*#+(.*\n)/, "");

  const slug = fileToSlug(file);
  const url = `/${DEFAULT_LOCALE}/${slug}/`;

  let sidebar: ModuleIndexEntry[];
  let parents: DocParent[];

  // For module overview and landing page set modules.
  let modules: ModuleIndexEntry[];
  let prevNext: PrevNext;
  if (!options?.forIndex) {
    if (attributes.template === Template.landing) {
      modules = (await buildModuleIndex())?.filter((x) => x.children?.length);
    } else if (attributes.template === Template.overview) {
      modules = (await buildModuleIndex())?.find(
        (x) => x.slug === slug
      )?.children;
    }
    if (attributes.template === Template.module) {
      prevNext = await buildPrevNext(slug);
    }

    sidebar = await buildSidebar();
    parents = await buildParents(url);
  } else {
    title = title.replace(/^\d+\s+/, "");
  }

  return {
    meta: {
      filename,
      slug,
      url,
      title,
      sidebar,
      modules,
      parents,
      prevNext,
      ...attributes,
    },
    body,
  };
}

export async function findModuleBySlug(
  slug: string
): Promise<ModuleData | null> {
  let file = await slugToFile(slug);
  if (!file) {
    file = await slugToFile(`${slug}${slug ? "/" : ""}README`);
  }
  let module;
  try {
    module = await readModule(file, { forIndex: false });
  } catch (e) {
    console.error(`No file found for ${slug}`, e);
    return;
  }
  const { body, meta } = module;

  const d: BuildData = {
    url: meta.url,
    rawBody: body,
    metadata: { locale: DEFAULT_LOCALE, ...meta },
    isMarkdown: true,
    fileInfo: {
      path: file,
    },
  };

  const doc = await buildModule(d);
  return { doc };
}

export async function buildModule(document: BuildData): Promise<Doc> {
  const { metadata } = document;

  const doc = { locale: DEFAULT_LOCALE } as Partial<CurriculumDoc>;
  let $ = null;

  const renderUrl = document.url.replace(/\/$/, "");
  [$] = await kumascript.render(renderUrl, {}, document as any);

  $("[data-token]").removeAttr("data-token");
  $("[data-flaw-src]").removeAttr("data-flaw-src");

  doc.title = metadata.title || "";
  doc.mdn_url = document.url;
  doc.locale = metadata.locale as string;
  doc.native = LANGUAGES_RAW[DEFAULT_LOCALE]?.native;

  if ($("math").length > 0) {
    doc.hasMathML = true;
  }
  $("div.hidden").remove();
  syntaxHighlight($, doc);
  injectNoTranslate($);
  injectLoadingLazyAttributes($);
  postProcessCurriculumLinks($, document.url);
  postProcessExternalLinks($);
  postLocalFileLinks($, doc);
  postProcessSmallerHeadingIDs($);
  wrapTables($);
  setCurriculumTypes($);
  try {
    const [sections] = await extractSections($);
    doc.body = sections;
  } catch (error) {
    console.error(
      `Extracting sections failed in ${doc.mdn_url} (${document.fileInfo.path})`
    );
    throw error;
  }

  doc.pageTitle = `${doc.title} | MDN Curriculum`;

  doc.noIndexing = false;
  doc.toc = makeTOC(doc, true);
  doc.sidebar = metadata.sidebar;
  doc.modules = metadata.modules;
  doc.prevNext = metadata.prevNext;
  doc.parents = metadata.parents;
  doc.topic = metadata.topic;

  return doc as Doc;
}

export async function buildCurriculum(options: {
  verbose?: boolean;
  noIndexing?: boolean;
}) {
  const locale = DEFAULT_LOCALE;

  for (const file of await allFiles()) {
    console.log(`building: ${file}`);

    const { meta, body } = await readModule(file, {
      forIndex: false,
    });

    const renderDoc: BuildData = {
      url: meta.url,
      rawBody: body,
      metadata: { locale, ...meta },
      isMarkdown: true,
      fileInfo: {
        path: file,
      },
    };
    const builtDoc = await buildModule(renderDoc);
    const { doc } = {
      doc: { ...builtDoc, summary: meta.summary, mdn_url: meta.url },
    };

    const context: HydrationData = {
      doc,
      pageTitle: meta.title,
      locale,
      noIndexing: options.noIndexing,
    };

    const outPath = path.join(
      BUILD_OUT_ROOT,
      locale.toLowerCase(),
      slugToFolder(meta.slug)
    );

    await fs.mkdir(outPath, { recursive: true });

    const html = renderHTML(`/${locale}/${meta.slug}/`, context);

    const filePath = path.join(outPath, "index.html");
    const jsonFilePath = path.join(outPath, "index.json");

    await fs.mkdir(outPath, { recursive: true });
    await fs.writeFile(filePath, html);
    await fs.writeFile(jsonFilePath, JSON.stringify(context));

    if (options.verbose) {
      console.log("Wrote", filePath);
    }
  }
}

function setCurriculumTypes($) {
  $("p").each((_, child) => {
    const p = $(child);
    const text = p.text();
    switch (text) {
      case "Learning outcomes:":
        p.addClass("curriculum-outcomes");
        break;
      case "General resources:":
      case "Resources:":
        p.addClass("curriculum-resources");
        break;
    }
  });

  $("p.curriculum-resources + ul > li").each((_, child) => {
    const li = $(child);

    if (li.find("a.external").length) {
      li.addClass("external");
    }
  });

  $("blockquote").each((_, child) => {
    const bq = $(child);

    const [p] = bq.find("p");

    if (p) {
      const notes = $(p);
      if (/Notes?:/.test(notes.text())) {
        bq.addClass("curriculum-notes");
      }
    }
  });
}
