const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");

const chalk = require("chalk");
const mysql = require("mysql");

const {
  CONTENT_ROOT,
  CONTENT_ARCHIVED_ROOT,
  CONTENT_TRANSLATED_ROOT,
  VALID_LOCALES,
  Document,
  Redirect,
  resolveFundamental,
} = require("../content");

const cheerio = require("../build/monkeypatched-cheerio");
const ProgressBar = require("./progress-bar");

console.assert(CONTENT_ROOT, "CONTENT_ROOT must be set");

const MAX_OPEN_FILES = 256;

// Contributors, from the revisions, that we deliberately ignore.
const IGNORABLE_CONTRIBUTORS = new Set(["mdnwebdocs-bot"]);

// Any slug that starts with one of these prefixes goes into a different
// folder; namely the archive folder.
// Case matters but 100% of Prod slugs are spelled like this. I.e.
// there's *no* slug that is something like this 'archiVe/Foo/Bar'.
const ARCHIVE_SLUG_ENGLISH_PREFIXES = [
  "Archive",
  "BrowserID",
  "Debugging",
  "Extensions",
  "Firefox_OS",
  "Garbage_MixedContentBlocker",
  "Gecko",
  "Hacking_Firefox",
  "Interfaces",
  "Mercurial",
  // "Mozilla",
  "Multi-Process_Architecture",
  "NSS",
  "nsS",
  "Performance",
  "Persona",
  "Preferences_System",
  "Sandbox",
  "SpiderMonkey",
  "Thunderbird",
  "Trash",
  "XML_Web_Services",
  "XUL",
  "XULREF",
  "Zones",

  // All the 'Mozilla/' prefixes, EXCEPT the ones we want to keep.
  // To see a list of the ones we keep, see
  // https://github.com/mdn/yari/issues/563
  "Mozilla/API",
  "Mozilla/About_omni.ja_(formerly_omni.jar)",
  "Mozilla/Accessibility",
  "Mozilla/Add-ons/AMO",
  "Mozilla/Add-ons/Add-on_Debugger",
  "Mozilla/Add-ons/Add-on_Manager",
  "Mozilla/Add-ons/Add-on_Repository",
  "Mozilla/Add-ons/Add-on_SDK",
  "Mozilla/Add-ons/Add-on_guidelines",
  "Mozilla/Add-ons/Adding_extensions_using_the_Windows_registry",
  "Mozilla/Add-ons/Bootstrapped_extensions",
  "Mozilla/Add-ons/Code_snippets",
  "Mozilla/Add-ons/Comparing_Extension_Toolchains",
  "Mozilla/Add-ons/Contact_us",
  "Mozilla/Add-ons/Creating_Custom_Firefox_Extensions_with_the_Mozilla_Build_System",
  "Mozilla/Add-ons/Creating_OpenSearch_plugins_for_Firefox",
  "Mozilla/Add-ons/Differences_between_desktop_and_Android",
  "Mozilla/Add-ons/Distribution",
  "Mozilla/Add-ons/Extension_Frequently_Asked_Questions",
  "Mozilla/Add-ons/Extension_Packaging",
  "Mozilla/Add-ons/Extension_etiquette",
  "Mozilla/Add-ons/Firefox_for_Android",
  "Mozilla/Add-ons/Hotfix",
  "Mozilla/Add-ons/How_to_convert_an_overlay_extension_to_restartless",
  "Mozilla/Add-ons/Index",
  "Mozilla/Add-ons/Inline_Options",
  "Mozilla/Add-ons/Install_Manifests",
  "Mozilla/Add-ons/Installing_extensions",
  "Mozilla/Add-ons/Interfacing_with_the_Add-on_Repository",
  "Mozilla/Add-ons/Legacy_Firefox_for_Android",
  "Mozilla/Add-ons/Legacy_add_ons",
  "Mozilla/Add-ons/Listing",
  "Mozilla/Add-ons/Overlay_Extensions",
  "Mozilla/Add-ons/Performance_best_practices_in_extensions",
  "Mozilla/Add-ons/Plugins",
  "Mozilla/Add-ons/SDK",
  "Mozilla/Add-ons/SeaMonkey_2",
  "Mozilla/Add-ons/Security_best_practices_in_extensions",
  "Mozilla/Add-ons/Setting_up_extension_development_environment",
  "Mozilla/Add-ons/Source_Code_Submission",
  "Mozilla/Add-ons/Submitting_an_add-on_to_AMO",
  "Mozilla/Add-ons/Techniques",
  "Mozilla/Add-ons/Themes",
  "Mozilla/Add-ons/Third_Party_Library_Usage",
  "Mozilla/Add-ons/Thunderbird",
  "Mozilla/Add-ons/Updates",
  "Mozilla/Add-ons/Webapps.jsm",
  "Mozilla/Add-ons/Why_develop_add-ons_For_Firefox",
  "Mozilla/Add-ons/Working_with_AMO",
  "Mozilla/Add-ons/Working_with_multiprocess_Firefox",
  "Mozilla/Adding_a_new_event",
  "Mozilla/Adding_a_new_style_property",
  "Mozilla/Adding_a_new_word_to_the_en-US_dictionary",
  "Mozilla/Adding_phishing_protection_data_providers",
  "Mozilla/An_introduction_to_hacking_Mozilla",
  "Mozilla/Android-specific_test_suites",
  "Mozilla/Application_cache_implementation_overview",
  "Mozilla/B2G_OS",
  "Mozilla/Benchmarking",
  "Mozilla/Bird_s_Eye_View_of_the_Mozilla_Framework",
  "Mozilla/Boot_to_Gecko",
  "Mozilla/Browser_chrome_tests",
  "Mozilla/Browser_security",
  "Mozilla/Bugzilla",
  "Mozilla/Building_Mozilla",
  "Mozilla/Building_SpiderMonkey_with_UBSan",
  "Mozilla/C++_Portability_Guide",
  "Mozilla/CSS",
  "Mozilla/Calendar",
  "Mozilla/Chat_Core",
  "Mozilla/Choosing_the_right_memory_allocator",
  "Mozilla/ChromeWorkers",
  "Mozilla/Chrome_Registration",
  "Mozilla/Command_Line_Options",
  "Mozilla/Connect",
  "Mozilla/Contact_us",
  "Mozilla/Continuous_integration",
  "Mozilla/Cookies_Preferences",
  "Mozilla/Cookies_in_Mozilla",
  "Mozilla/Cpp_portability_guide",
  "Mozilla/Creating_JavaScript_callbacks_in_components",
  "Mozilla/Creating_Mercurial_User_Repositories",
  "Mozilla/Creating_MozSearch_plugins",
  "Mozilla/Creating_a_Firefox_sidebar",
  "Mozilla/Creating_a_dynamic_status_bar_extension",
  "Mozilla/Creating_a_language_pack",
  "Mozilla/Creating_a_localized_Windows_installer_of_SeaMonkey",
  "Mozilla/Creating_a_login_manager_storage_module",
  "Mozilla/Creating_a_spell_check_dictionary_add-on",
  "Mozilla/Creating_reftest-based_unit_tests",
  "Mozilla/Creating_sandboxed_HTTP_connections",
  "Mozilla/Debugging",
  "Mozilla/Developer_Program",
  "Mozilla/Displaying_Place_information_using_views",
  "Mozilla/Errors",
  "Mozilla/Firefox/Australis_add-on_compat",
  "Mozilla/Firefox/Build_system",
  "Mozilla/Firefox/Building_Firefox_with_Rust_code",
  "Mozilla/Firefox/Developer_Edition",
  "Mozilla/Firefox/Enterprise_deployment",
  "Mozilla/Firefox/Firefox_ESR",
  "Mozilla/Firefox/Headless_mode",
  "Mozilla/Firefox/Index",
  "Mozilla/Firefox/Linux_compatibiility_matrix",
  "Mozilla/Firefox/Linux_compatibility_matrix",
  "Mozilla/Firefox/Multiple_profiles",
  "Mozilla/Firefox/Multiprocess_Firefox",
  "Mozilla/Firefox/Per-test_coverage",
  "Mozilla/Firefox/Performance_best_practices_for_Firefox_fe_engineers",
  "Mozilla/Firefox/Privacy",
  "Mozilla/Firefox/Security_best_practices_for_Firefox_front-end_engi",
  "Mozilla/Firefox/Site_identity_button",
  "Mozilla/Firefox/The_about_protocol",
  "Mozilla/Firefox/UI_considerations",
  "Mozilla/Firefox/Updating_add-ons_for_Firefox_10",
  "Mozilla/Firefox/Updating_add-ons_for_Firefox_5",
  "Mozilla/Firefox/Updating_add-ons_for_Firefox_6",
  "Mozilla/Firefox/Updating_add-ons_for_Firefox_8",
  "Mozilla/Firefox/Updating_add-ons_for_Firefox_9",
  "Mozilla/Firefox/Updating_extensions_for_Firefox_7",
  "Mozilla/Firefox/Versions/14",
  "Mozilla/Firefox/australis-add-on-compat-draft",
  "Mozilla/Firefox/releases/3/CSS_improvements",
  "Mozilla/FirefoxOS",
  "Mozilla/Firefox_1.5_for_Developers",
  "Mozilla/Firefox_25_for_developers",
  "Mozilla/Firefox_28_for_developers",
  "Mozilla/Firefox_Accounts",
  "Mozilla/Firefox_OS",
  "Mozilla/Firefox_Operational_Information_Database:_SQLite",
  "Mozilla/Firefox_addons_developer_guide",
  "Mozilla/Firefox_clone",
  "Mozilla/Firefox_for_Android",
  "Mozilla/Firefox_for_iOS",
  "Mozilla/Gecko",
  "Mozilla/Getting_from_Content_to_Layout",
  "Mozilla/Getting_started_with_IRC",
  "Mozilla/Git",
  "Mozilla/HTTP_cache",
  "Mozilla/Hacking_with_Bonsai",
  "Mozilla/How_Mozilla_determines_MIME_Types",
  "Mozilla/How_test_harnesses_work",
  "Mozilla/How_to_Turn_Off_Form_Autocompletion",
  "Mozilla/How_to_add_a_build-time_test",
  "Mozilla/How_to_get_a_process_dump_with_Windows_Task_Manager",
  "Mozilla/How_to_get_a_stacktrace_for_a_bug_report",
  "Mozilla/How_to_get_a_stacktrace_with_WinDbg",
  "Mozilla/How_to_implement_custom_autocomplete_search_component",
  "Mozilla/How_to_investigate_Disconnect_failures",
  "Mozilla/How_to_report_a_hung_Firefox",
  "Mozilla/IME_handling_guide",
  "Mozilla/IPDL",
  "Mozilla/Implementing_Pontoon_in_a_Mozilla_website",
  "Mozilla/Implementing_QueryInterface",
  "Mozilla/Implementing_download_resuming",
  "Mozilla/Infallible_memory_allocation",
  "Mozilla/Instantbird",
  "Mozilla/Integrated_authentication",
  "Mozilla/Internal_CSS_attributes",
  "Mozilla/Internationalized_domain_names_support_in_Mozilla",
  "Mozilla/Introduction",
  "Mozilla/JS_libraries",
  "Mozilla/JavaScript-DOM_Prototypes_in_Mozilla",
  "Mozilla/JavaScript_Tips",
  "Mozilla/JavaScript_code_modules",
  "Mozilla/Localization",
  "Mozilla/MFBT",
  "Mozilla/Marketplace",
  "Mozilla/MathML_Project",
  "Mozilla/Memory_Sanitizer",
  "Mozilla/Mercurial",
  "Mozilla/Mobile",
  "Mozilla/Mozilla_DOM_Hacking",
  "Mozilla/Mozilla_Framework_Based_on_Templates_(MFBT)",
  "Mozilla/Mozilla_Port_Blocking",
  "Mozilla/Mozilla_SVG_Project",
  "Mozilla/Mozilla_Web_Developer_Community",
  "Mozilla/Mozilla_Web_Developer_FAQ",
  "Mozilla/Mozilla_Web_Services_Security_Model",
  "Mozilla/Mozilla_development_strategies",
  "Mozilla/Mozilla_development_tools",
  "Mozilla/Mozilla_external_string_guide",
  "Mozilla/Mozilla_on_GitHub",
  "Mozilla/Mozilla_project_presentations",
  "Mozilla/Mozilla_quirks_mode_behavior",
  "Mozilla/Mozilla_style_system",
  "Mozilla/Multiple_Firefox_Profiles",
  "Mozilla/NSPR",
  "Mozilla/Namespaces",
  "Mozilla/Participating_in_the_Mozilla_project",
  "Mozilla/Performance",
  "Mozilla/Persona",
  "Mozilla/Phishing",
  "Mozilla/Preferences",
  "Mozilla/Productization_guide",
  "Mozilla/Profile_Manager",
  "Mozilla/Projects",
  "Mozilla/QA",
  "Mozilla/RAII_classes",
  "Mozilla/Redis_Tips",
  "Mozilla/Rust",
  "Mozilla/SeaMonkey",
  "Mozilla/Security",
  "Mozilla/Setting_up_an_update_server",
  "Mozilla/Signing_Mozilla_apps_for_Mac_OS_X",
  "Mozilla/Supported_build_configurations",
  "Mozilla/Task_graph",
  "Mozilla/Tech",
  "Mozilla/Test-Info",
  "Mozilla/Testing",
  "Mozilla/The_Mozilla_platform",
  "Mozilla/Thunderbird",
  "Mozilla/Toolkit_version_format",
  "Mozilla/Using_CXX_in_Mozilla_code",
  "Mozilla/Using_JS_in_Mozilla_code",
  "Mozilla/Using_Mozilla_code_in_other_projects",
  "Mozilla/Using_XML_Data_Islands_in_Mozilla",
  "Mozilla/Using_popup_notifications",
  "Mozilla/Using_tab-modal_prompts",
  "Mozilla/Using_the_Mozilla_source_server",
  "Mozilla/Using_the_Mozilla_symbol_server",
  "Mozilla/WebIDL_bindings",
  "Mozilla/Working_with_windows_in_chrome_code",
  "Mozilla/XMLHttpRequest_changes_for_Gecko_1.8",
  "Mozilla/XPCOM",
  "Mozilla/XPConnect",
  "Mozilla/XPI",
  "Mozilla/XRE",
  "Mozilla/Zombie_compartments",
  "Mozilla/httpd.js",
  "Mozilla/js-ctypes",
  "Mozilla/security-bugs-policy",
];

const OLD_LOCALE_PREFIXES = new Map([
  ["en", "en-US"],
  ["cn", "zh-CN"],
  ["zh_tw", "zh-TW"],
  ["zh", "zh-TW"],
  ["pt", "pt-PT"],
]);
// Double check that every value of the old locale mappings
// point to valid ones.
assert(
  [...OLD_LOCALE_PREFIXES.values()].every((x) =>
    [...VALID_LOCALES.values()].includes(x)
  )
);

function makeURL(locale, slug) {
  return `/${locale}/docs/${encodeURI(slug)}`;
}

const redirectsToArchive = new Set();
const redirectFinalDestinations = new Map();
const archiveSlugPrefixes = [...ARCHIVE_SLUG_ENGLISH_PREFIXES];

function startsWithArchivePrefix(uri) {
  return archiveSlugPrefixes.some((prefix) =>
    uriToSlug(uri).startsWith(prefix)
  );
}

function isArchiveRedirect(uri) {
  return redirectsToArchive.has(uri) || startsWithArchivePrefix(uri);
}

async function populateRedirectInfo(pool, constraintsSQL, queryArgs) {
  // Populates two data structures: "redirectsToArchive", a set of URI's
  // that ultimately redirect to a page that will be archived, as well as
  // "redirectFinalDestinations", a mapping of the URI's of redirects
  // to the URI of their final destination.

  function extractFromChain(toUri, chainOfRedirects) {
    // Recursive function that builds the set of redirects to
    // archive, as well as the map that provides the final
    // destination of each redirect that we'll keep.
    const isInfiniteLoop = chainOfRedirects.has(toUri);
    if (!isInfiniteLoop) {
      const nextUri = redirects.get(toUri);
      if (nextUri) {
        return extractFromChain(nextUri, chainOfRedirects.add(toUri));
      }
    }
    // Is the final destination meant to be archived?
    if (isInfiniteLoop || startsWithArchivePrefix(toUri)) {
      for (const uri of chainOfRedirects) {
        // All of these URI's ultimately redirect to a page that
        // will be archived or are involved in an inifinite loop.
        // We'll only add to the set of "redirectsToArchive" those
        // that are not already covered by "archiveSlugPrefixes".
        if (!startsWithArchivePrefix(uri)) {
          // console.log(`adding to archive: ${uri}`);
          redirectsToArchive.add(uri);
        }
      }
    }
    // Let's record the final destination of each URI in the chain.
    for (const uri of chainOfRedirects) {
      redirectFinalDestinations.set(uri, toUri);
    }
  }

  const redirectDocs = await queryRedirects(pool, constraintsSQL, queryArgs);

  redirectDocs.on("error", (error) => {
    console.error("Querying redirect documents failed with", error);
    process.exit(1);
  });

  const redirects = new Map();

  for await (const row of redirectDocs) {
    if (row.slug.startsWith("/")) {
      console.warn("Bad redirect (slug starts with /)", [row.locale, row.slug]);
      continue;
    }
    if (row.slug.includes("//")) {
      console.warn("Bad redirect (slug contains '//')", [row.locale, row.slug]);
      continue;
    }
    let redirect = null;
    const fromUri = makeURL(row.locale, row.slug);
    const fundamentalRedirect = resolveFundamental(fromUri).url;
    if (fundamentalRedirect) {
      redirect = fundamentalRedirect;
    } else {
      const processedRedirectUrl = (processRedirect(row, fromUri) || {}).url;
      const fundamentalTargetRedirect =
        processedRedirectUrl && resolveFundamental(processedRedirectUrl).url;
      redirect = fundamentalTargetRedirect || processedRedirectUrl;
    }
    if (redirect) {
      if (fromUri.toLowerCase() === redirect.toLowerCase()) {
        console.log("Bad redirect (from===to)", [fromUri]);
      } else {
        redirects.set(fromUri, redirect);
      }
    }
  }

  for (const [fromUri, toUri] of redirects.entries()) {
    extractFromChain(toUri, new Set([fromUri]));
  }
}

function getSQLConstraints(
  { alias = null, parentAlias = null, includeDeleted = false } = {},
  options
) {
  // Yeah, this is ugly but it bloody works for now.
  const a = alias ? `${alias}.` : "";
  const extra = [];
  const queryArgs = [];
  // Always exclude these. These are straggler documents that don't yet
  // have a revision
  extra.push(`${a}current_revision_id IS NOT NULL`);
  // There aren't many but these get excluded in kuma anyway.
  extra.push(`${a}html <> ''`);

  if (!includeDeleted) {
    extra.push(`${a}deleted = false`);
  }
  const { locales, excludePrefixes } = options;
  if (locales.length) {
    extra.push(`${a}locale in (?)`);
    queryArgs.push(locales);
  }
  if (excludePrefixes.length) {
    extra.push(
      `NOT (${excludePrefixes.map(() => `${a}slug LIKE ?`).join(" OR ")})`
    );
    queryArgs.push(...excludePrefixes.map((s) => `${s}%`));
    if (parentAlias) {
      extra.push(
        `((${parentAlias}.slug IS NULL) OR NOT (${excludePrefixes
          .map(() => `${parentAlias}.slug LIKE ?`)
          .join(" OR ")}))`
      );
      queryArgs.push(...excludePrefixes.map((s) => `${s}%`));
    }
  }

  return {
    constraintsSQL: ` WHERE ${extra.join(" AND ")}`,
    queryArgs,
  };
}

async function queryContributors(query, options) {
  const [contributors, usernames] = await Promise.all([
    (async () => {
      console.log("Going to fetch ALL contributor *mappings*");
      const { constraintsSQL, queryArgs } = getSQLConstraints(
        {
          includeDeleted: true,
          alias: "d",
        },
        options
      );
      const documentCreators = await query(
        `
          SELECT r.document_id, r.creator_id
          FROM wiki_revision r
          INNER JOIN wiki_document d ON r.document_id = d.id
          ${constraintsSQL}
          ORDER BY r.created DESC
        `,
        queryArgs
      );
      const contributors = {};
      for (const { document_id, creator_id } of documentCreators) {
        if (!(document_id in contributors)) {
          contributors[document_id] = []; // Array because order matters
        }
        if (!contributors[document_id].includes(creator_id)) {
          contributors[document_id].push(creator_id);
        }
      }
      return contributors;
    })(),
    (async () => {
      console.log("Going to fetch ALL contributor *usernames*");
      const users = await query("SELECT id, username FROM auth_user");
      const usernames = {};
      for (const user of users) {
        usernames[user.id] = user.username;
      }
      return usernames;
    })(),
  ]);

  return { contributors, usernames };
}

async function queryDocumentCount(query, constraintsSQL, queryArgs) {
  const localesSQL = `
    SELECT w.locale, COUNT(*) AS count
    FROM wiki_document w
    LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL}
    GROUP BY w.locale
    ORDER BY count DESC
  `;
  const results = await query(localesSQL, queryArgs);

  let totalCount = 0;
  console.log(`LOCALE\tDOCUMENTS`);
  let countNonEnUs = 0;
  let countEnUs = 0;
  for (const { count, locale } of results) {
    console.log(`${locale}\t${count.toLocaleString()}`);
    totalCount += count;
    if (locale === "en-US") {
      countEnUs += count;
    } else {
      countNonEnUs += count;
    }
  }

  if (countNonEnUs && countEnUs) {
    const nonEnUsPercentage = (100 * countNonEnUs) / (countNonEnUs + countEnUs);
    console.log(
      `(FYI ${countNonEnUs.toLocaleString()} (${nonEnUsPercentage.toFixed(
        1
      )}%) are non-en-US)`
    );
  }

  return totalCount;
}

async function queryRedirects(pool, constraintsSQL, queryArgs) {
  const documentsSQL = `
    SELECT
      w.html,
      w.slug,
      w.locale,
      w.is_redirect
    FROM wiki_document w
    LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL} AND w.is_redirect = true
  `;

  return pool
    .query(documentsSQL, queryArgs)
    .stream({ highWaterMark: MAX_OPEN_FILES })
    .pipe(new stream.PassThrough({ objectMode: true }));
}

async function addLocalizedArchiveSlugPrefixes(
  query,
  constraintsSQL,
  queryArgs
) {
  // Adds all of the localized versions of the English archive
  // slug prefixes to "archiveSlugPrefixes".
  const slugsSQL = `
    SELECT
      w.slug
    FROM wiki_document w
    INNER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL} AND p.slug in (?)
  `;

  queryArgs.push(ARCHIVE_SLUG_ENGLISH_PREFIXES);

  const slugsFromLocales = await query(slugsSQL, queryArgs);

  for (const slug of new Set(slugsFromLocales)) {
    if (!archiveSlugPrefixes.includes(slug)) {
      archiveSlugPrefixes.push(slug);
    }
  }
}

async function queryDocuments(pool, options) {
  const { constraintsSQL, queryArgs } = getSQLConstraints(
    {
      alias: "w",
      parentAlias: "p",
    },
    options
  );

  const query = promisify(pool.query).bind(pool);

  await addLocalizedArchiveSlugPrefixes(query, constraintsSQL, queryArgs);
  await populateRedirectInfo(pool, constraintsSQL, queryArgs);
  const totalCount = await queryDocumentCount(query, constraintsSQL, queryArgs);

  const documentsSQL = `
    SELECT
      w.id,
      w.title,
      w.slug,
      w.locale,
      w.is_redirect,
      w.html,
      w.rendered_html,
      w.modified,
      p.id AS parent_id,
      p.slug AS parent_slug,
      p.locale AS parent_locale,
      p.modified AS parent_modified,
      p.is_redirect AS parent_is_redirect
    FROM wiki_document w
    LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL}
  `;

  return {
    totalCount,
    stream: pool
      .query(documentsSQL, queryArgs)
      .stream({ highWaterMark: MAX_OPEN_FILES })
      // node MySQL uses custom streams which are not iterable. Piping it through a native stream fixes that
      .pipe(new stream.PassThrough({ objectMode: true })),
  };
}

async function queryDocumentTags(query, options) {
  const { constraintsSQL, queryArgs } = getSQLConstraints(
    {
      alias: "w",
    },
    options
  );
  const sql = `
    SELECT
      w.id,
      t.name
    FROM wiki_document w
    INNER JOIN wiki_taggeddocument wt ON wt.content_object_id = w.id
    INNER JOIN wiki_documenttag t ON t.id = wt.tag_id
    ${constraintsSQL}
  `;

  console.log("Going to fetch ALL document tags");
  const results = await query(sql, queryArgs);
  const tags = {};
  for (const row of results) {
    if (!(row.id in tags)) {
      tags[row.id] = [];
    }
    tags[row.id].push(row.name);
  }
  return tags;
}

async function withTimer(label, fn) {
  console.time(label);
  const result = await fn();
  console.timeEnd(label);
  return result;
}

function isArchiveDoc(row) {
  return (
    archiveSlugPrefixes.some(
      (prefix) =>
        row.slug.startsWith(prefix) ||
        (row.parent_slug && row.parent_slug.startsWith(prefix))
    ) ||
    (row.is_redirect && isArchiveRedirect(makeURL(row.locale, row.slug))) ||
    (row.parent_slug &&
      row.parent_is_redirect &&
      isArchiveRedirect(makeURL(row.parent_locale, row.parent_slug)))
  );
}

function uriToSlug(uri) {
  if (uri.includes("/docs/")) {
    return uri.split("/docs/")[1];
  }
  return uri;
}

async function prepareRoots(options) {
  console.assert(CONTENT_ARCHIVED_ROOT, "CONTENT_ARCHIVED_ROOT must be set");
  console.assert(
    CONTENT_TRANSLATED_ROOT,
    "CONTENT_TRANSLATED_ROOT must be set"
  );

  if (CONTENT_ROOT === CONTENT_ARCHIVED_ROOT) throw new Error("eh?!");
  if (CONTENT_ROOT === CONTENT_TRANSLATED_ROOT) throw new Error("eh?!");
  if (options.startClean) {
    // Experimental new feature
    // https://nodejs.org/api/fs.html#fs_fs_rmdirsync_path_options
    await withTimer(`Delete all of ${CONTENT_ROOT}`, () =>
      fs.rmdirSync(CONTENT_ROOT, { recursive: true })
    );
    await withTimer(`Delete all of ${CONTENT_ARCHIVED_ROOT}`, () =>
      fs.rmdirSync(CONTENT_ARCHIVED_ROOT, { recursive: true })
    );
    await withTimer(`Delete all of ${CONTENT_TRANSLATED_ROOT}`, () =>
      fs.rmdirSync(CONTENT_TRANSLATED_ROOT, { recursive: true })
    );
  }
  fs.mkdirSync(CONTENT_ROOT, { recursive: true });
  fs.mkdirSync(CONTENT_ARCHIVED_ROOT, { recursive: true });
  fs.mkdirSync(CONTENT_TRANSLATED_ROOT, { recursive: true });
}

function populateExistingFilePaths() {
  // Populate the global set `existingFilePaths` with every existing folder path
  // that currently exists in all the roots.
  for (const root of [
    CONTENT_ROOT,
    CONTENT_ARCHIVED_ROOT,
    CONTENT_TRANSLATED_ROOT,
  ]) {
    for (const filepath of walker(root)) {
      if (filepath.endsWith("index.html")) {
        existingFilePaths.add(filepath);
      }
    }
  }
}

function* walker(root) {
  const files = fs.readdirSync(root);
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield* walker(filepath);
    } else {
      yield filepath;
    }
  }
}

function getRedirectURL(html) {
  /**
   * Sometimes the HTML is like this:
   *   'REDIRECT <a class="redirect" href="/docs/http://wiki.commonjs.org/wiki/C_API">http://wiki.commonjs.org/wiki/C_API</a>'
   * and sometimes it's like this:
   *   'REDIRECT <a class="redirect" href="/en-US/docs/Web/API/WebGL_API">WebGL</a>'
   * and sometimes it's like this:
   *   'REDIRECT <a class="redirect" href="/en-US/docs/https://developer.mozilla.org/en-US/docs/Mozilla">Firefox Marketplace FAQ</a>'
   *
   * So we need the "best of both worlds".
   * */
  const $ = cheerio.load(html);
  for (const a of $("a[href].redirect").toArray()) {
    const hrefHref = $(a).attr("href");
    const hrefText = $(a).text();

    if (hrefHref.includes("http://")) {
      // Life's too short to accept these. Not only is it scary to even
      // consider sending our users to a http:// site but it's not
      // even working in Kuma because in Kuma redirects that
      // start with '/docs/http://..' end up in a string of redirects
      // and eventually fails with a 404.
      return null;
    }

    let href;
    if (hrefHref.startsWith("https://")) {
      href = hrefHref;
    } else if (
      hrefHref.includes("/https://") &&
      hrefText.startsWith("https://")
    ) {
      href = hrefText;
    } else if (hrefHref.includes("/https://")) {
      href = "https://" + hrefHref.split("https://")[1];
    } else {
      href = hrefHref;
    }
    if (href.startsWith("https://developer.mozilla.org")) {
      return new URL(href).pathname;
    } else {
      return href;
    }
  }
  return null;
}

function test_getRedirectURL(href, text, expect) {
  const h = `REDIRECT <a class="redirect" href="${href}">${text}</a>`;
  const r = getRedirectURL(h);
  assert(r === expect, `${r}  !=  ${expect}`);
}

test_getRedirectURL(
  "/en-US/docs/Persona",
  "/en-US/docs/Persona",
  "/en-US/docs/Persona"
);
test_getRedirectURL(
  "/en-US/docs/Persona",
  "Persona was cool",
  "/en-US/docs/Persona"
);
test_getRedirectURL(
  "/docs/En/NsIPlacesView",
  "En/NsIPlacesView",
  "/docs/En/NsIPlacesView"
);
test_getRedirectURL(
  "/docs/https://wiki.commonjs.org/wiki/Binary",
  "https://wiki.commonjs.org/wiki/Binary",
  "https://wiki.commonjs.org/wiki/Binary"
);
test_getRedirectURL(
  "/docs/http://wiki.commonjs.org/wiki/Binary",
  "http://wiki.commonjs.org/wiki/Binary",
  null
);
test_getRedirectURL(
  "/docs/https://wiki.commonjs.org/wiki/Binary",
  "Plain text",
  "https://wiki.commonjs.org/wiki/Binary"
);

test_getRedirectURL(
  "https://developer.mozilla.org/en-US/docs/Mozilla/Projects/",
  "SpiderMonkey",
  "/en-US/docs/Mozilla/Projects/"
);
test_getRedirectURL(
  "/en-US/docs/https://developer.mozilla.org/en-US/docs/Mozilla/Marketplace",
  "Firefox Marketplace",
  "/en-US/docs/Mozilla/Marketplace"
);
test_getRedirectURL(
  "/en-US/docs/tools/Keyboard_shortcuts#Source_editor",
  "/en-US/docs/tools/Keyboard_shortcuts",
  "/en-US/docs/tools/Keyboard_shortcuts#Source_editor"
);
test_getRedirectURL(
  "https://www.peterbe.com/",
  "Peterbe.com",
  "https://www.peterbe.com/"
);

const REDIRECT_HTML = "REDIRECT <a ";

// Return either 'null' or an object that looks like this:
//
//  { url: redirectURL, status: null };
//  or
//  { url: null, status: "mess" }
//  or
//  { url: fixedRedirectURL, status: "improved" }
//
// So basically, if it's an object it has the keys 'url' and 'status'.
function processRedirect(doc, absoluteURL) {
  if (!doc.html.includes(REDIRECT_HTML)) {
    console.log(`${doc.locale}/${doc.slug} is redirect but no REDIRECT_HTML`);
    return null;
  }

  let redirectURL = getRedirectURL(doc.html);
  if (!redirectURL) {
    return null;
  }

  if (redirectURL.includes("://")) {
    if (
      redirectURL.includes("developer.mozilla.org") ||
      redirectURL.includes("/http")
    ) {
      console.warn(
        "WEIRD REDIRECT:",
        redirectURL,
        "  FROM  ",
        `https://developer.mozilla.org${encodeURI(absoluteURL)}`,
        doc.html
      );
    }
    // Generally, leave external redirects untouched
    return { url: redirectURL, status: null };
  }

  return postProcessRedirectURL(redirectURL);
}

function postProcessRedirectURL(redirectURL) {
  if (redirectURL === "/") {
    return { url: "/en-US/", status: "improved" };
  }
  const split = redirectURL.split("/");
  let locale;
  if (split[1] === "docs") {
    // E.g. /docs/en/JavaScript
    locale = split[2];
  } else if (split[2] == "docs") {
    // E.g. /en/docs/HTML
    locale = split[1];
  } else if (!split.includes("docs")) {
    // E.g. /en-us/Addons
    locale = split[1];
  } else {
    // That's some seriously messed up URL!
    locale = null;
  }

  if (locale) {
    const localeLC = locale.toLowerCase();
    if (OLD_LOCALE_PREFIXES.has(localeLC)) {
      locale = OLD_LOCALE_PREFIXES.get(localeLC);
    } else if (VALID_LOCALES.has(localeLC)) {
      locale = VALID_LOCALES.get(localeLC);
    } else {
      // If the URL contains no recognizable locale that can be cleaned up
      // we have to assume 'en-US'. There are so many redirect URLs
      // in MySQL that look like this: '/docs/Web/JavaScript...'
      // And for them we have to assume it's '/en-US/docs/Web/JavaScript...'
      locale = "en-US";
      split.splice(1, 0, locale);
    }
  }

  // No valid locale found. We have to try to fix that manually.
  if (!locale) {
    console.log(split, { redirectURL });
    throw new Error("WHAT THE HELL?");
  }

  // E.g. '/en/' or '/en-uS/' or '/fr'
  if (!split.includes("docs") && split.filter((x) => x).length === 1) {
    return { url: `/${locale}/`, status: null };
  }

  // E.g. '/en/docs/Foo' or '/en-us/docs/Foo' - in other words; perfect
  // but the locale might need to be corrected
  if (split[2] === "docs") {
    if (locale !== split[1]) {
      split[1] = locale;
      return { url: split.join("/"), status: "improved" };
    }
    return { url: split.join("/"), status: null };
  }

  // E.g. '/en-US/Foo/Bar' or '/en/Foo/Bar'
  if (!split.includes("docs")) {
    // The locale is valid but it's just missing the '/docs/' part
    split[1] = locale;
    split.splice(2, 0, "docs");
    return { url: split.join("/"), status: "improved" };
  }

  // E.g. '/docs/en-uS/Foo' or '/docs/cn/Foo'
  if (split[1] === "docs") {
    split.splice(2, 1); // remove the local after '/docs/'
    split.splice(1, 0, locale); // put the (correct) locale in before
    return { url: split.join("/"), status: "improved" };
  }

  return { url: null, status: "mess" };
}

function test_postProcessRedirectURL(a, b) {
  let got = postProcessRedirectURL(a);
  if (b) {
    assert(got.url === b, `${got.url} != ${b}`);
  } else {
    assert(!got.url, `Expected null but got: ${JSON.stringify(got)}`);
  }
}
test_postProcessRedirectURL("/", "/en-US/");
test_postProcessRedirectURL("/en-US/", "/en-US/");
test_postProcessRedirectURL("/en-US", "/en-US/");
test_postProcessRedirectURL("/en-us", "/en-US/");
test_postProcessRedirectURL("/en/", "/en-US/");
test_postProcessRedirectURL("/en", "/en-US/");

test_postProcessRedirectURL("/en-US/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en-uS/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/zh/Foo", "/zh-TW/docs/Foo");
test_postProcessRedirectURL("/pt/Foo", "/pt-PT/docs/Foo");

test_postProcessRedirectURL("/docs/en-US/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/docs/EN-us/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/docs/en/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/docs/cn/Foo", "/zh-CN/docs/Foo");

test_postProcessRedirectURL("/docs/cn/Foo", "/zh-CN/docs/Foo");
test_postProcessRedirectURL("/docs/Foo", "/en-US/docs/Foo");

test_postProcessRedirectURL("/en-us/docs/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en/docs/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en-US/docs/Foo", "/en-US/docs/Foo");

// Global that keeps track of all meta files that get built.
// It's used so that we can make absolutely sure that we don't
// build something that was already built as that would indicate
// that two different slugs lead to the exact same name as a file.
const allBuiltPaths = new Set();

async function processDocument(
  doc,
  { startClean },
  isArchive = false,
  localeWikiHistory,
  { usernames, contributors, tags }
) {
  const { slug, locale, title } = doc;

  const docPath = path.join(locale, slug);
  if (startClean && allBuiltPaths.has(docPath)) {
    throw new Error(`${docPath} already exists!`);
  } else {
    allBuiltPaths.add(docPath);
  }

  const meta = {
    title,
    slug,
    locale,
  };
  if (doc.parent_slug) {
    assert(doc.parent_locale === "en-US");
    if (doc.parent_is_redirect) {
      const parentUri = makeURL(doc.parent_locale, doc.parent_slug);
      const finalUri = redirectFinalDestinations.get(parentUri);
      meta.translation_of = uriToSlug(finalUri);
    } else {
      meta.translation_of = doc.parent_slug;
    }
  }

  const wikiHistory = {
    modified: doc.modified.toISOString(),
  };

  const docTags = tags[doc.id] || [];
  if (docTags.length) {
    meta.tags = docTags.sort();
  }

  const docContributors = (contributors[doc.id] || [])
    .map((userId) => usernames[userId])
    .filter((username) => !IGNORABLE_CONTRIBUTORS.has(username));
  if (docContributors.length) {
    wikiHistory.contributors = docContributors;
  }

  localeWikiHistory.set(doc.slug, wikiHistory);

  // If we're building this page, we can remove
  let builtFolderPath;

  if (isArchive) {
    builtFolderPath = Document.archive(
      getCleanedRenderedHTML(doc.rendered_html),
      doc.html,
      meta,
      // The Document.archive() is used for genuinely archived content,
      // but we also treat translated content the same way ultimately.
      !isArchive
    );
  } else {
    builtFolderPath = Document.create(getCleanedKumaHTML(doc.html), meta);
  }
  builtFilePaths.add(path.join(builtFolderPath, "index.html"));
}

function getCleanedRenderedHTML(html) {
  const $ = cheerio.load(`<div id="_body">${html}</div>`);
  let mutations = 0;

  // This will only happen for fully rendered HTML.
  // https://github.com/mdn/yari/issues/1248
  $("#Quick_Links a[title]").each((i, element) => {
    const $element = $(element);
    $element.removeAttr("title");
    mutations++;
  });

  $("div.warning, div.blockIndicator").each((i, element) => {
    const $element = $(element);
    $element.addClass("notecard");
    $element.removeClass("blockIndicator");
    mutations++;
  });

  $("span.inlineIndicator, span.indicatorInHeadline").each((i, element) => {
    const $element = $(element);
    $element.addClass("notecard");
    $element.addClass("inline");
    $element.removeClass("inlineIndicator");
    $element.removeClass("indicatorInHeadline");
    mutations++;
  });

  $("div.prevnext a").each((i, element) => {
    $(element).addClass("button");
    mutations++;
  });

  $("div.bc-data[id]").each((i, element) => {
    const $element = $(element);
    $element.empty();
    mutations++;
  });

  if (mutations) {
    return $("#_body").html();
  }
  return html;
}

// https://github.com/mdn/yari/issues/1191
const _DELETE_STRINGS = [
  new RegExp(
    '<div class="hidden">The compatibility table on this page is generated from structured data. If you\'d like to contribute to the data, please check out <a href="https://github.com/mdn/browser-compat-data">https://github.com/mdn/browser-compat-data</a> and send us a pull request.</div>'
  ),
  new RegExp(
    '<div class="hidden">The compatibility table in this page is generated from structured data. If you\'d like to contribute to the data, please check out <a href="https://github.com/mdn/browser-compat-data">https://github.com/mdn/browser-compat-data</a> and send us a pull request.</div>'
  ),
  new RegExp(
    '<p class="hidden">The source for this interactive example is stored in a GitHub repository. If you\'d like to contribute to the interactive examples project, please clone <a href="https://github.com/mdn/interactive-examples">https://github.com/mdn/interactive-examples</a> and send us a pull request.</p>'
  ),
];
function getCleanedKumaHTML(html) {
  // You can't parse the Kuma HTML because it's not actually HTML. It's
  // HTML peppered with KS macros. So here we need to treat it as a string.
  for (const rex of _DELETE_STRINGS) {
    html = html.replace(rex, "");
  }
  return html;
}

async function saveAllRedirects(redirects) {
  const byLocale = {};
  for (const [fromUrl, toUrl] of Object.entries(redirects)) {
    const locale = fromUrl.split("/")[1];
    if (!(locale in byLocale)) {
      byLocale[locale] = [];
    }
    byLocale[locale].push([fromUrl, toUrl]);
  }

  const countPerLocale = [];
  for (const [locale, pairs] of Object.entries(byLocale)) {
    pairs.sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
    countPerLocale.push([locale, pairs.length]);
    const root = locale === "en-US" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
    const localeFolder = path.join(root, locale.toLowerCase());
    console.log("LOCALE", locale, "TO", localeFolder);
    if (!fs.existsSync(localeFolder)) {
      console.log(
        `No content for ${locale}, so skip ${pairs.length} redirects`
      );
    } else {
      Redirect.write(localeFolder, pairs);
    }
  }

  console.log("# Redirects per locale");
  countPerLocale.sort((a, b) => b[1] - a[1]);
  for (const [locale, count] of countPerLocale) {
    console.log(`${locale.padEnd(10)}${count.toLocaleString()}`);
  }
}

async function saveWikiHistory(allHistory, isArchive) {
  /**
   * The 'allHistory' is an object that looks like this:
   *
   * {'en-us': {
   *   'Games/Foo': {
   *     modified: '2019-01-21T12:13:14',
   *     contributors: ['Gregoor', 'peterbe', 'ryan']
   *   }
   *  }}
   *
   * But, it's a Map!
   *
   * Save these so that there's a _wikihistory.json in every locale folder.
   */

  for (const [locale, history] of allHistory) {
    const root = isArchive
      ? CONTENT_ARCHIVED_ROOT
      : locale === "en-US"
      ? CONTENT_ROOT
      : CONTENT_TRANSLATED_ROOT;
    const localeFolder = path.join(root, locale.toLowerCase());
    const filePath = path.join(localeFolder, "_wikihistory.json");
    const obj = Object.create(null);
    const keys = Array.from(history.keys());
    keys.sort();
    for (const key of keys) {
      obj[key] = history.get(key);
    }
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
  }
}

function formatSeconds(s) {
  if (s > 60) {
    const m = Math.floor(s / 60);
    s = Math.floor(s % 60);
    return `${m}m${s}s`;
  } else {
    return s.toFixed(1);
  }
}

const builtFilePaths = new Set();
const existingFilePaths = new Set();

module.exports = async function runImporter(options) {
  options = { locales: [], excludePrefixes: [], ...options };

  await prepareRoots(options);

  if (!options.startClean) {
    // Having this set makes it possible to eventually compare with the Set
    // `builtFolderPath` and you can see which ones were NOT built this time.
    // That complement represents the files we can delete now.
    populateExistingFilePaths(options);
    console.log(
      `NOTE! We found ${existingFilePaths.size.toLocaleString()} existing file paths`
    );
  }

  const pool = mysql.createPool(options.dbURL);

  console.log(
    `Going to try to connect to ${pool.config.connectionConfig.database} (locales=${options.locales})`
  );
  console.log(
    `Going to exclude the following slug prefixes: ${options.excludePrefixes}`
  );

  const query = promisify(pool.query).bind(pool);
  const [{ usernames, contributors }, tags] = await Promise.all([
    withTimer("Time to fetch all contributors", () =>
      queryContributors(query, options)
    ),
    withTimer("Time to fetch all document tags", () =>
      queryDocumentTags(query, options)
    ),
  ]);

  let startTime = Date.now();

  const documents = await queryDocuments(pool, options);

  const progressBar = !options.noProgressbar
    ? new ProgressBar({
        includeMemory: true,
      })
    : null;

  if (!options.noProgressbar) {
    progressBar.init(documents.totalCount);
  }

  documents.stream.on("error", (error) => {
    console.error("Querying documents failed with", error);
    process.exit(1);
  });

  let processedDocumentsCount = 0;
  let pendingDocuments = 0;

  const redirects = {};
  let improvedRedirects = 0;
  let messedupRedirects = 0;
  let discardedRedirects = 0;
  let archivedRedirects = 0;
  let fundamentalRedirects = 0;
  let fastForwardedRedirects = 0;

  const allWikiHistory = new Map();
  const archiveWikiHistory = new Map();

  for await (const row of documents.stream) {
    processedDocumentsCount++;

    while (pendingDocuments > MAX_OPEN_FILES) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    pendingDocuments++;
    (async () => {
      const currentDocumentIndex = processedDocumentsCount;
      // Only update (and repaint) every 20th time.
      // Make it much more than every 1 time or else it'll flicker.
      if (progressBar && currentDocumentIndex % 20 == 0) {
        progressBar.update(currentDocumentIndex);
      }

      const absoluteUrl = makeURL(row.locale, row.slug);
      const isFundamentalRedirect = resolveFundamental(absoluteUrl).url;
      if (isFundamentalRedirect) {
        fundamentalRedirects++;
        return;
      }
      const isArchive = isArchiveDoc(row);
      if (row.is_redirect) {
        if (isArchive) {
          // This redirect or its parent is a page that will
          // be archived, or eventually arrives at a page that
          // will be archived. So just drop it!
          archivedRedirects++;
          return;
        }
        const redirect = processRedirect(row, absoluteUrl);
        if (!redirect) {
          discardedRedirects++;
          return;
        }
        if (redirect.url) {
          const finalUri = redirectFinalDestinations.get(absoluteUrl);
          if (redirect.url !== finalUri) {
            fastForwardedRedirects++;
          }
          redirects[absoluteUrl] = finalUri;
        }
        if (redirect.status == "mess") {
          messedupRedirects++;
        } else if (redirect.status == "improved") {
          improvedRedirects++;
        }
      } else {
        assert(row.locale);
        if (isArchive) {
          if (!archiveWikiHistory.has(row.locale)) {
            archiveWikiHistory.set(row.locale, new Map());
          }
        } else {
          if (!allWikiHistory.has(row.locale)) {
            allWikiHistory.set(row.locale, new Map());
          }
        }
        await processDocument(
          row,
          options,
          isArchive,
          isArchive
            ? archiveWikiHistory.get(row.locale)
            : allWikiHistory.get(row.locale),
          {
            usernames,
            contributors,
            tags,
          }
        );
      }
    })()
      .catch((err) => {
        console.log("An error occured during processing");
        console.error(err);
        // The slightest unexpected error should stop the importer immediately.
        process.exit(1);
      })
      .then(() => {
        pendingDocuments--;
      });
  }

  if (!options.noProgressbar) {
    progressBar.stop();
  }

  pool.end();
  if (!options.skipWikiHistories) {
    await saveWikiHistory(allWikiHistory, false);
    await saveWikiHistory(archiveWikiHistory, true);
  }
  await saveAllRedirects(redirects);

  if (improvedRedirects) {
    console.log(
      chalk.bold(improvedRedirects.toLocaleString()),
      "redirects were corrected as they used the old URL style."
    );
  }
  if (messedupRedirects) {
    console.log(
      chalk.bold(messedupRedirects.toLocaleString()),
      "redirects were ignored because they would lead to an infinite redirect loop."
    );
  }
  if (discardedRedirects) {
    console.log(
      chalk.bold(discardedRedirects.toLocaleString()),
      "redirects that could not be imported."
    );
  }
  if (archivedRedirects) {
    console.log(
      chalk.bold(archivedRedirects.toLocaleString()),
      "redirects that are considered archived content ignored."
    );
  }
  if (fastForwardedRedirects) {
    console.log(
      chalk.bold(fastForwardedRedirects.toLocaleString()),
      "redirects were fast-forwarded directly to their final destination."
    );
  }
  if (fundamentalRedirects) {
    console.log(
      chalk.bold(fundamentalRedirects.toLocaleString()),
      "fundamental redirects were skipped."
    );
  }

  const endTime = Date.now();
  const secondsTook = (endTime - startTime) / 1000;
  console.log(
    chalk.green(
      `Took ${formatSeconds(secondsTook)} seconds to process ${chalk.bold(
        processedDocumentsCount.toLocaleString()
      )} rows.`
    )
  );
  console.log(
    `Roughly ${(processedDocumentsCount / secondsTook).toFixed(1)} rows/sec.`
  );

  console.log("\nThe following documents existed before but were NOT built");
  for (const filePath of existingFilePaths) {
    if (filePath.includes("kitchensink")) {
      continue;
    }
    if (!builtFilePaths.has(filePath)) {
      console.log("\t", `rm "${filePath}"`);
    }
  }
};
