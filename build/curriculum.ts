import { fdir } from "fdir";
import { BUILD_OUT_ROOT, CURRICULUM_ROOT } from "../libs/env/index.js";
import { Doc } from "../libs/types/document.js";
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
  SidebarEntry,
} from "../libs/types/curriculum.js";
import frontmatter from "front-matter";
import { HydrationData } from "../libs/types/hydration.js";
import { memoize, slugToFolder } from "../content/utils.js";
import { renderHTML } from "../ssr/dist/main.js";

async function allFiles(): Promise<string[]> {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => filePath.endsWith(".md"))
    .crawl(path.join(CURRICULUM_ROOT, "curriculum"));
  return await api.withPromise();
}

export const buildIndex = memoize(async () => {
  const files = await allFiles();
  const modules = await Promise.all(
    files.map(
      async (file) =>
        (await readModule(file, { previousNext: false, sidebar: false })).meta
    )
  );
  return modules;
});

export async function buildSidebar(): Promise<SidebarEntry[]> {
  const index = await buildIndex();

  const s = index.reduce((sidebar, { url, title, slug }) => {
    const currentLvl = slug.split("/").length;
    const last = sidebar.length ? sidebar[sidebar.length - 1] : null;
    const entry = {
      url,
      title,
      slug,
    };
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

async function readModule(
  file: string,
  options?: {
    previousNext?: boolean;
    sidebar?: boolean;
  }
): Promise<{ meta: ModuleMetaData; body: string; sidebar: any }> {
  const raw = await fs.readFile(file, "utf-8");
  const { attributes, body: rawBody } = frontmatter<CurriculumFrontmatter>(raw);
  const filename = file.replace(CURRICULUM_ROOT, "").replace(/^\/?/, "");
  const title = rawBody.match(/^[\w\n]*#+(.*\n)/)[1]?.trim();
  const body = rawBody.replace(/^[\w\n]*#+(.*\n)/, "");

  const slug = filename.replace(/\.md$/, "").replace("/0-README", "");
  const url = `/${DEFAULT_LOCALE}/${slug}/`;

  const sidebar = options?.sidebar && (await buildSidebar());

  return {
    meta: { filename, slug, url, title, ...attributes },
    sidebar,
    body,
  };
}

export async function findModuleBySlug(
  slug: string
): Promise<ModuleData | null> {
  let slugPath = `${slug}.md`.split("/");
  let file = path.join(CURRICULUM_ROOT, "curriculum", ...slugPath);
  let module;
  try {
    module = await readModule(file, { sidebar: true });
  } catch {
    slugPath = `${slug}/0-README.md`.split("/");
    file = path.join(CURRICULUM_ROOT, "curriculum", ...slugPath);
    try {
      module = await readModule(file, { sidebar: true });
    } catch {
      console.error(`No file found for ${slug}`);
    }
  }
  const { body, meta, sidebar } = module;

  const d = {
    url: meta.url,
    rawBody: body,
    metadata: { locale: DEFAULT_LOCALE, ...meta },
    isMarkdown: true,
    fileInfo: {
      path: file,
    },
    sidebar,
  };

  const doc = await buildModule(d);
  return { doc, curriculumMeta: meta };
}

export async function buildModule(document: any): Promise<Doc> {
  const { metadata, sidebar } = document;

  const doc = { locale: DEFAULT_LOCALE } as Partial<Doc>;
  let $ = null;

  [$] = await kumascript.render(document.url, {}, document as any);

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

  doc.pageTitle = `${doc.title} | MDN Blog`;

  doc.noIndexing = false;
  doc.toc = makeTOC(doc, true);
  doc.sidebar = sidebar;

  return doc as Doc;
}

export async function buildCurriculum(options: {
  verbose?: boolean;
  noIndexing?: boolean;
}) {
  const locale = DEFAULT_LOCALE;

  for (const file of await allFiles()) {
    console.log(`building: ${file}`);

    const { meta, body, sidebar } = await readModule(file, { sidebar: true });

    const url = meta.url;
    const renderUrl = url.replace(/\/$/, "");
    const renderDoc = {
      url: renderUrl,
      rawBody: body,
      metadata: { locale, ...meta },
      isMarkdown: true,
      fileInfo: {
        path: file,
      },
    };
    const builtDoc = await buildModule(renderDoc);
    const { doc } = {
      doc: { ...builtDoc, summary: meta.summary, mdn_url: url, sidebar },
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
      if (notes.text() === "Notes:") {
        bq.addClass("curriculum-notes");
      }
    }
  });
}
