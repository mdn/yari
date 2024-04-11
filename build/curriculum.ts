import path from "node:path";
import fs from "node:fs/promises";

import { fdir } from "fdir";
import frontmatter from "front-matter";

import { BUILD_OUT_ROOT, CURRICULUM_ROOT } from "../libs/env/index.js";
import { DocParent } from "../libs/types/document.js";
import { CURRICULUM_TITLE, DEFAULT_LOCALE } from "../libs/constants/index.js";
import * as kumascript from "../kumascript/index.js";
import LANGUAGES_RAW from "../libs/languages/index.js";
import { syntaxHighlight } from "./syntax-highlight.js";
import {
  escapeRegExp,
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
import {
  CurriculumFrontmatter,
  CurriculumData,
  CurriculumMetaData,
  CurriculumIndexEntry,
  PrevNext,
  Template,
  CurriculumDoc,
  ReadCurriculum,
  CurriculumBuildData,
} from "../libs/types/curriculum.js";
import { HydrationData } from "../libs/types/hydration.js";
import { memoize, slugToFolder } from "../content/utils.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CheerioAPI } from "cheerio";

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
        (
          await readCurriculumPage(file, {
            previousNext: false,
            forIndex: true,
          })
        ).meta
    )
  );
  return modules;
});

export function fileToSlug(file: string) {
  return file
    .replace(`${CURRICULUM_ROOT}/`, "")
    .replace(/(\d+-|\.md$|\/0?-?README)/g, "");
}

export async function slugToFile(slug: string) {
  const all = await allFiles();
  const re = new RegExp(
    path.join(
      escapeRegExp(CURRICULUM_ROOT),
      "curriculum",
      `${slug
        .split("/")
        .map((x) => String.raw`(\d+-)?${escapeRegExp(x)}`)
        .join("/")}.md`
    )
  );
  return all.find((x) => {
    return re.test(x);
  });
}

export async function buildCurriculumIndex(
  mapper: (x: CurriculumMetaData) => CurriculumIndexEntry = (x) => x
): Promise<CurriculumIndexEntry[]> {
  const index: CurriculumMetaData[] = await buildIndex();

  const curriculumIndex = index.reduce<CurriculumIndexEntry[]>((item, meta) => {
    const currentLevel = meta.slug.split("/").length;
    const last = item.length ? item[item.length - 1] : null;
    const entry = mapper(meta);
    if (currentLevel > 2) {
      if (last) {
        last.children.push(entry);
        return item;
      }
    }

    item.push({ children: [], ...entry });
    return item;
  }, []);

  return curriculumIndex;
}

async function buildCurriculumSidebar(): Promise<CurriculumIndexEntry[]> {
  const index = await buildCurriculumIndex(({ url, slug, title }) => {
    return { url, slug, title };
  });

  return index;
}

// This consumes (as in modifies) index.
function prevNextFromIndex(
  i: number,
  index: CurriculumMetaData[] | CurriculumIndexEntry[]
): PrevNext {
  const prevEntry = i > 0 ? index[i - 1] : undefined;
  const nextEntry = i < index.length - 1 ? index[i + 1] : undefined;

  prevEntry && "children" in prevEntry && delete prevEntry.children;
  nextEntry && "children" in nextEntry && delete nextEntry.children;

  return { prev: prevEntry, next: nextEntry };
}

async function buildPrevNextOverview(slug: string): Promise<PrevNext> {
  const index = (await buildCurriculumIndex()).filter(
    (x) => x?.children?.length
  );
  const i = index.findIndex((x) => x.slug === slug);
  return prevNextFromIndex(i, index);
}

async function buildPrevNextModule(slug: string): Promise<PrevNext> {
  const index = await buildIndex();
  const i = index.findIndex((x) => x.slug === slug);
  return prevNextFromIndex(i, index);
}

function breadcrumbPath(
  url: string,
  entries: CurriculumIndexEntry[]
): DocParent[] | null {
  for (const entry of entries) {
    if (entry.url === url) {
      return [{ uri: entry.url, title: entry.title }];
    }
    if (entry.children?.length) {
      const found = breadcrumbPath(url, entry.children);
      if (found) {
        return [{ uri: entry.url, title: entry.title }, ...found];
      }
    }
  }
  return null;
}

async function buildParents(url: string): Promise<DocParent[]> {
  const index = await buildCurriculumIndex(({ url, title }) => {
    return { url, title };
  });
  const parents = breadcrumbPath(url, index);
  if (parents) {
    const { url, title } = index[0];
    if (parents[0]?.uri !== url) {
      return [{ uri: url, title }, ...parents];
    }
    return parents;
  }

  return [];
}

async function readCurriculumPage(
  file: string,
  options?: {
    previousNext?: boolean;
    forIndex?: boolean;
  }
): Promise<ReadCurriculum> {
  const raw = await fs.readFile(file, "utf-8");
  const { attributes, body: rawBody } = frontmatter<CurriculumFrontmatter>(raw);
  const filename = file.replace(CURRICULUM_ROOT, "").replace(/^\/?/, "");
  const title = rawBody.match(/^[\w\n]*#+(.*\n)/)[1]?.trim() || "";
  const body = rawBody.replace(/^[\w\n]*#+(.*\n)/, "");

  const slug = fileToSlug(file);
  const url = `/${DEFAULT_LOCALE}/${slug}/`;

  let sidebar: CurriculumIndexEntry[];
  let parents: DocParent[];

  let modules: CurriculumIndexEntry[];
  let prevNext: PrevNext;
  let group: string;
  if (!options?.forIndex) {
    if (attributes.template === Template.Landing) {
      modules = (await buildCurriculumIndex())?.filter(
        (x) => x.children?.length
      );
    } else if (attributes.template === Template.Overview) {
      modules = (await buildCurriculumIndex())?.find(
        (x) => x.slug === slug
      )?.children;
    }
    if (attributes.template === Template.Module) {
      prevNext = await buildPrevNextModule(slug);
    } else if (attributes.template === Template.Overview) {
      prevNext = await buildPrevNextOverview(slug);
    }

    sidebar = await buildCurriculumSidebar();
    parents = await buildParents(url);
    if (parents.length > 1) {
      const title = parents.at(-2)?.title;
      if (title?.endsWith(" modules")) {
        group = title;
      }
    }
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
      group,
      ...attributes,
    },
    body,
  };
}

export async function findCurriculumPageBySlug(
  slug: string
): Promise<CurriculumData | null> {
  const file =
    (await slugToFile(slug)) || (await slugToFile(path.join(slug, "README")));
  let module: ReadCurriculum;
  try {
    module = await readCurriculumPage(file, { forIndex: false });
  } catch (e) {
    console.error(`No file found for ${slug}: ${e}`);
    return null;
  }
  const { body, meta } = module;

  const d: CurriculumBuildData = {
    url: meta.url,
    rawBody: body,
    metadata: { locale: DEFAULT_LOCALE, ...meta },
    isMarkdown: true,
    fileInfo: {
      path: file,
    },
  };

  const doc = await buildCurriculumPage(d);
  return { doc };
}

export async function buildCurriculumPage(
  document: CurriculumBuildData
): Promise<CurriculumDoc> {
  const { metadata } = document;

  const doc = { locale: DEFAULT_LOCALE } as Partial<CurriculumDoc>;

  const renderUrl = document.url.replace(/\/$/, "");
  const [$] = await kumascript.render(renderUrl, {}, document);

  $("[data-token]").removeAttr("data-token");
  $("[data-flaw-src]").removeAttr("data-flaw-src");

  doc.title = metadata.title;
  doc.mdn_url = document.url;
  doc.locale = metadata.locale;
  doc.native = LANGUAGES_RAW[DEFAULT_LOCALE]?.native;

  if ($("math").length > 0) {
    doc.hasMathML = true;
  }
  $("div.hidden").remove();
  syntaxHighlight($, doc);
  injectNoTranslate($);
  injectLoadingLazyAttributes($);
  postProcessCurriculumLinks($, (p: string | undefined) => {
    const [head, hash] = p?.split("#") || [];
    const slug = fileToSlug(
      path.normalize(path.join(path.dirname(document.fileInfo.path), head))
    ).replace(/\/$/, "");
    return `/${DEFAULT_LOCALE}/${slug}/${hash ? `#${hash}` : ""}`;
  });
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

  doc.pageTitle = doc.title
    ? `${doc.title} | ${CURRICULUM_TITLE}`
    : CURRICULUM_TITLE;

  doc.noIndexing = false;
  doc.toc = makeTOC(doc, true);
  doc.sidebar = metadata.sidebar;
  doc.modules = metadata.modules;
  doc.prevNext = metadata.prevNext;
  doc.parents = metadata.parents;
  doc.topic = metadata.topic;
  doc.group = metadata.group;

  return doc as CurriculumDoc;
}

export async function buildCurriculum(options: {
  verbose?: boolean;
  noIndexing?: boolean;
}) {
  const locale = DEFAULT_LOCALE;

  for (const file of await allFiles()) {
    const { meta, body } = await readCurriculumPage(file, {
      forIndex: false,
    });

    const renderDoc: CurriculumBuildData = {
      url: meta.url,
      rawBody: body,
      metadata: { locale, ...meta },
      isMarkdown: true,
      fileInfo: {
        path: file,
      },
    };
    const builtDoc = await buildCurriculumPage(renderDoc);
    const { doc } = {
      doc: { ...builtDoc, summary: meta.summary, mdn_url: meta.url },
    };

    const context: HydrationData = {
      doc,
      pageTitle: meta.title,
      locale,
      noIndexing: options.noIndexing,
      url: `/${locale}/${meta.slug}/`,
    };

    const outPath = path.join(
      BUILD_OUT_ROOT,
      locale.toLowerCase(),
      slugToFolder(meta.slug)
    );

    await fs.mkdir(outPath, { recursive: true });

    const jsonFilePath = path.join(outPath, "index.json");

    await fs.mkdir(outPath, { recursive: true });
    await fs.writeFile(jsonFilePath, JSON.stringify(context));

    if (options.verbose) {
      console.log("Wrote", jsonFilePath);
    }
  }
}

function setCurriculumTypes($: CheerioAPI) {
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
      if (/((general )?notes?):/i.test(notes.text())) {
        bq.addClass("curriculum-notes");
      }
    }
  });
}
