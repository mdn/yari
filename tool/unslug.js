const {
  buildURL,
  execGit,
  slugToFolder,
  Document,
  Redirect,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
} = require("../content");
const glob = require("glob");
const chalk = require("chalk");
const path = require("path");
const fm = require("front-matter");
const fs = require("fs");
const log = require("loglevel");
const crypto = require("crypto");

const CONFLICTING = "conflicting";
const ORPHANED = "orphaned";

function runPass(locale, files, redirects, stats, fistPass) {
  const secondPassFiles = [];
  for (const f of files) {
    const {
      moved,
      conflicting,
      redirect,
      dehashed,
      orphaned,
      followed,
      secondPass = false,
    } = unslug(f, locale, !fistPass);
    if (redirect) {
      redirects.set(redirect[0], redirect[1]);
    }
    if (moved) {
      stats.movedDocs += 1;
    }
    if (conflicting) {
      stats.conflictingDocs += 1;
    }
    if (dehashed) {
      stats.dehashedDocs += 1;
    }
    if (orphaned) {
      stats.orphanedDocs += 1;
    }
    if (followed) {
      stats.redirectedDocs += 1;
    }
    if (fistPass && secondPass) {
      secondPassFiles.push(f);
    }
  }
  return secondPassFiles;
}

function unslugAll(locale) {
  const redirects = new Map();
  const files = glob.sync(
    path.join(CONTENT_TRANSLATED_ROOT, locale, "**", "index.html")
  );
  const stats = {
    movedDocs: 0,
    conflictingDocs: 0,
    dehashedDocs: 0,
    orphanedDocs: 0,
    redirectedDocs: 0,
    totalDocs: files.length,
  };

  // Run the first pass of unslugging, collecting all files for the 2nd pass.
  const secondPassFiles = runPass(locale, files, redirects, stats, true);
  log.log(`second pass for ${secondPassFiles.length} docs`);
  // Run the second pass.
  runPass(locale, secondPassFiles, redirects, stats, false);

  Redirect.add(locale, [...redirects.entries()], true);

  const changes = [...redirects.entries()].reduce(
    (map, [from, to]) => {
      if (to.toLowerCase().startsWith(`/${locale}/docs/${ORPHANED}/`)) {
        map.orphaned.push([from, to]);
      } else if (
        to.toLowerCase().startsWith(`/${locale}/docs/${CONFLICTING}/`)
      ) {
        map.conflicting.push([from, to]);
      } else {
        map.moved.push([from, to]);
      }
      return map;
    },
    { orphaned: [], conflicting: [], moved: [] }
  );
  return { stats, changes };
}

function resolve(slug) {
  if (!slug) {
    return slug;
  }
  const url = buildURL("en-us", slug);
  const resolved = Redirect.resolve(url);
  if (url !== resolved) {
    const filePath = path.join(
      CONTENT_ROOT,
      Document.urlToFolderPath(resolved),
      "index.html"
    );
    if (!fs.existsSync(filePath)) {
      return slug;
    }
    const {
      attributes: { slug: resolvedSlug },
    } = fm(fs.readFileSync(filePath, "utf8"));
    if (slug !== resolvedSlug) {
      return resolvedSlug;
    }
  }
  return slug;
}

function unslug(inFilePath, locale, secondPass = false) {
  const status = {
    redirect: null,
    conflicting: false,
    dehashed: false,
    moved: false,
    orphaned: false,
    followed: false,
  };

  const rawDoc = fs.readFileSync(inFilePath, "utf8");
  const { attributes: oldMetadata, body: rawHTML } = fm(rawDoc);
  const translationOfOrginal = oldMetadata.translation_of_original;
  const resolvedSlug = resolve(oldMetadata.slug);
  const originalContentSlug = resolve(oldMetadata.translation_of);
  const metadata = {
    ...oldMetadata,
    slug: originalContentSlug || resolvedSlug,
  };

  status.moved = oldMetadata.slug.toLowerCase() !== metadata.slug.toLowerCase();

  if (status.moved) {
    if (
      metadata.slug === originalContentSlug &&
      originalContentSlug.toLowerCase() !==
        oldMetadata.translation_of.toLowerCase()
    ) {
      log.log(
        chalk.bold(
          `Translation of redirect: ${metadata.slug} → ${oldMetadata.translation_of}`
        )
      );
      status.followed = true;
    } else if (
      metadata.slug === resolvedSlug &&
      resolvedSlug.toLowerCase() !== oldMetadata.slug.toLowerCase()
    ) {
      log.log(
        chalk.bold(`Original redirect: ${oldMetadata.slug} → ${metadata.slug}`)
      );
      status.followed = true;
    }
  }

  const dehash = () => {
    const hash = metadata.slug.indexOf("#");
    if (hash < 0) {
      status.dehashed = false;
      return;
    }
    status.dehashed = true;
    status.moved = true;
    log.warn(chalk.yellow(`${metadata.slug} contains #, stripping`));
    metadata.slug = metadata.slug.substring(0, hash);
  };

  const getFilePath = () => {
    const folderPath = path.join(
      CONTENT_TRANSLATED_ROOT,
      locale,
      slugToFolder(metadata.slug)
    );

    const filePath = path.join(folderPath, "index.html");
    return filePath;
  };

  dehash();
  let filePath = getFilePath();

  status.orphaned = !fs.existsSync(
    path.join(CONTENT_ROOT, "en-us", slugToFolder(metadata.slug), "index.html")
  );

  if (!status.moved && !status.orphaned) {
    return status;
  }

  if (status.orphaned) {
    log.log(chalk.yellow(`orphaned: ${inFilePath}`));
    status.followed = false;
    metadata.slug = `${ORPHANED}/${metadata.slug}`;
    status.moved = true;
    filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      log.log(`${inFilePath} → ${filePath}`);
      throw new Error(`file: ${filePath} already exists!`);
    }
  } else if (fs.existsSync(filePath)) {
    if (translationOfOrginal) {
      if (!secondPass) {
        return { secondPass: true };
      }
      log.log(
        chalk.yellow(`unrooting: ${inFilePath} (conflicting translation)`)
      );
    } else if (status.dehashed) {
      log.log(
        chalk.yellow(`unrooting ${inFilePath} (conflicting translation - hash)`)
      );
    } else {
      `unrooting ${inFilePath} (conflicting translation)`;
    }
    metadata.slug = `${CONFLICTING}/${metadata.slug}`;
    status.conflicting = true;
    status.moved = true;
    filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      metadata.slug = `${metadata.slug}_${crypto
        .createHash("md5")
        .update(oldMetadata.slug)
        .digest("hex")}`;
      filePath = getFilePath();
    }
  }

  status.redirect = [
    buildURL(locale, oldMetadata.slug),
    buildURL(locale, metadata.slug),
  ];

  log.log(`${inFilePath} → ${filePath}`);
  Document.updateWikiHistory(
    path.join(CONTENT_TRANSLATED_ROOT, locale.toLowerCase()),
    oldMetadata.slug,
    metadata.slug
  );
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  execGit(["mv", inFilePath, filePath], { cwd: CONTENT_TRANSLATED_ROOT });
  metadata.original_slug = oldMetadata.slug;
  Document.saveHTMLFile(filePath, Document.trimLineEndings(rawHTML), metadata);
  try {
    fs.rmdirSync(path.dirname(inFilePath));
  } catch (e) {
    if (e.code !== "ENOTEMPTY") {
      throw e;
    }
  }
  return status;
}

module.exports = {
  unslug,
  unslugAll,
};
