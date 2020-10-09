const fs = require("fs");
// const childProcess = require("child_process");

const Parser = require("../kumascript/src/parser.js");
const { normalizeMacroName } = require("../kumascript/src/render.js");
// const { CONTENT_ROOT, REPOSITORY_URLS } = require("../content");
const buildOptions = require("../build/build-options");

async function analyzeDocument(document, documentOptions = {}) {
  // Important that the "local" document options comes last.
  // And use Object.assign to create a new object instead of mutating the
  // global one.
  // const options = Object.assign({}, buildOptions, documentOptions);
  const { metadata } = document;

  const doc = {
    ...metadata,
    isArchive: !!document.isArchive,
    isTranslated: !!document.isTranslated,
  };

  doc.flaws = {};

  // let renderedHtml = "";
  // let flaws = [];
  // const liveSamples = [];

  // if (doc.isArchive) {
  //   renderedHtml = document.rawHTML;
  // } else {
  //   [renderedHtml, flaws] = await kumascript.render(document.url);

  //   const sampleIds = kumascript.getLiveSampleIDs(
  //     document.metadata.slug,
  //     document.rawHTML
  //   );
  //   for (const sampleIdObject of sampleIds) {
  //     const liveSamplePage = kumascript.buildLiveSamplePage(
  //       document.url,
  //       document.metadata.title,
  //       renderedHtml,
  //       sampleIdObject
  //     );
  //     if (liveSamplePage.flaw) {
  //       flaws.push(liveSamplePage.flaw.updateFileInfo(fileInfo));
  //       continue;
  //     }
  //     liveSamples.push({
  //       id: sampleIdObject.id.toLowerCase(),
  //       html: liveSamplePage.html,
  //     });
  //   }

  //   if (flaws.length) {
  //     if (options.flawLevels.get("macros") === FLAW_LEVELS.ERROR) {
  //       // Report and exit immediately on the first document with flaws.
  //       console.error(
  //         chalk.red.bold(
  //           `Flaws (${flaws.length}) within ${document.metadata.slug} while rendering macros:`
  //         )
  //       );
  //       flaws.forEach((flaw, i) => {
  //         console.error(chalk.bold.red(`${i + 1}: ${flaw.name}`));
  //         console.error(chalk.red(`${flaw}\n`));
  //       });
  //       // XXX This is probably the wrong way to bubble up.
  //       process.exit(1);
  //     } else if (options.flawLevels.get("macros") === FLAW_LEVELS.WARN) {
  //       // doc.flaws.macros = flaws;
  //       // The 'flaws' array don't have everything we need from the
  //       // kumascript rendering, so we "beef it up" to have convenient
  //       // attributes needed.
  //       doc.flaws.macros = flaws.map((flaw, i) => {
  //         const fixable =
  //           flaw.name === "MacroRedirectedLinkError" &&
  //           (!flaw.filepath || flaw.filepath === document.fileInfo.path);
  //         const suggestion = fixable
  //           ? flaw.macroSource.replace(
  //               flaw.redirectInfo.current,
  //               flaw.redirectInfo.suggested
  //             )
  //           : null;
  //         const id = `macro_flaw${i}`;
  //         return Object.assign({ id, fixable, suggestion }, flaw);
  //       });
  //     }
  //   }
  // }

  doc.normalizedMacrosCount = {};
  const tokens = Parser.parse(document.rawHTML);
  for (let token of tokens) {
    if (token.type === "MACRO") {
      const normalizedMacroName = normalizeMacroName(token.name);
      if (!(normalizedMacroName in doc.normalizedMacrosCount)) {
        doc.normalizedMacrosCount[normalizedMacroName] = 0;
      }
      doc.normalizedMacrosCount[normalizedMacroName]++;
    }
  }
  // doc.rawHTML = document.rawHTML;
  doc.tags = document.metadata.tags || [];

  // console.log(document);
  doc.fileSize = fs.statSync(document.fileInfo.path).size;
  doc.title = metadata.title;
  doc.mdn_url = document.url;
  // Check and scrutinize any local image references

  // If the document has a `.popularity` make sure don't bother with too
  // many significant figures on it.
  doc.popularity = metadata.popularity
    ? Number(metadata.popularity.toFixed(4))
    : 0.0;

  doc.modified = metadata.modified || null;

  const otherTranslations = document.translations || [];
  if (!otherTranslations.length && metadata.translation_of) {
    // If built just-in-time, we won't have a record of all the other translations
    // available. But if the current document has a translation_of, we can
    // at least use that.
    otherTranslations.push({ locale: "en-US", slug: metadata.translation_of });
  }

  if (otherTranslations.length) {
    doc.other_translations = otherTranslations;
  }

  return doc;
}

module.exports = {
  analyzeDocument,

  options: buildOptions,
};
