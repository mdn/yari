import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { eachLimit } from "async";
import cliProgress from "cli-progress";
import { fdir, PathsOutput } from "fdir";
import fse from "fs-extra";
import { temporaryDirectory } from "tempy";
import * as cheerio from "cheerio";
import { fileTypeFromFile } from "file-type";
import imagemin from "imagemin";
import imageminPngquantPkg from "imagemin-pngquant";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";
import isSvg from "is-svg";

import { MAX_FILE_SIZE } from "../libs/env/index.js";
import {
  VALID_MIME_TYPES,
  MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
} from "../libs/constants/index.js";

const { default: imageminPngquant } = imageminPngquantPkg;

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) {
    return `${(bytes / 1024.0 / 1024.0).toFixed(1)}MB`;
  }
  if (bytes > 1024) {
    return `${(bytes / 1024.0).toFixed(1)}KB`;
  }
  return `${bytes}b`;
}

interface CheckerOptions {
  saveCompression?: boolean;
}

class FixableError extends Error {
  fixCommand: string;

  constructor(message: string, fixCommand: string) {
    super(message);
    this.fixCommand = fixCommand;
  }

  toString() {
    return `${this.constructor.name}: ${this.message}`;
  }
}

function getRelativePath(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

export async function checkFile(
  filePath: string,
  options: CheckerOptions = {}
) {
  // Check that the filename is always lowercase.
  const expectedPath = path.join(
    path.dirname(filePath),
    path.basename(filePath).toLowerCase()
  );
  if (filePath !== expectedPath) {
    throw new Error(
      `Base name must be lowercase (not ${path.basename(
        filePath
      )}). Please rename the file and update its usages.`
    );
  }

  // Check that the file size is >0 and <MAX_FILE_SIZE.
  const stat = await fs.stat(filePath);
  if (!stat.size) {
    throw new Error(`${filePath} is 0 bytes`);
  }

  // Ensure that binary files contain what their extension indicates.
  if (/\.(mp3|mp4|ogg|webm|woff2?)$/i.test(filePath)) {
    const ext = filePath.split(".").pop();
    const type = await fileTypeFromFile(filePath);
    if (!type) {
      throw new Error(`Failed to detect type of file attachment: ${filePath}`);
    }
    if (ext.toLowerCase() !== type.ext) {
      throw new Error(
        `Unexpected type '${type.mime}' (*.${type.ext}) detected for file attachment: ${filePath}.`
      );
    }
  }

  // FileType can't check for .svg files.
  // So use special case for files called '*.svg'
  if (path.extname(filePath) === ".svg") {
    // SVGs must not contain any script tags
    const content = await fs.readFile(filePath, "utf-8");
    if (!isSvg(content)) {
      throw new Error(`${filePath} does not appear to be an SVG`);
    }
    const $ = cheerio.load(content);
    const disallowedTagNames = new Set(["script", "object", "iframe", "embed"]);
    $("*").each((i, element) => {
      if (!("tagName" in element)) {
        return;
      }
      const { tagName } = element;
      if (disallowedTagNames.has(tagName)) {
        throw new Error(`${filePath} contains a <${tagName}> tag`);
      }
      for (const key in element.attribs) {
        if (/(\\x[a-f0-9]{2}|\b)on\w+/.test(key)) {
          throw new Error(
            `${filePath} <${tagName}> contains an unsafe attribute: '${key}'`
          );
        }
      }
    });
  } else {
    // Check that the file extension matches the file header.
    const fileType = await fileTypeFromFile(filePath);
    if (!fileType) {
      // This can easily happen if the .png (for example) file is actually just
      // a text file and not a binary.
      throw new Error(
        `${getRelativePath(
          filePath
        )} file-type could not be extracted at all ` +
          `(probably not a ${path.extname(filePath)} file)`
      );
    }
    if (!VALID_MIME_TYPES.has(fileType.mime)) {
      throw new Error(
        `${getRelativePath(filePath)} has an unrecognized mime type: ${
          fileType.mime
        }`
      );
    } else if (
      path.extname(filePath).replace(".jpeg", ".jpg").slice(1) !== fileType.ext
    ) {
      // If the file is a 'image/png' but called '.jpe?g', that's wrong.
      throw new Error(
        `${getRelativePath(filePath)} of type '${
          fileType.mime
        }' should have extension '${
          fileType.ext
        }', but has extension '${path.extname(
          filePath
        )}'. Please rename the file and update its usages.`
      );
    }
  }

  // The image has to be mentioned in the adjacent index.html document
  const parentPath = path.dirname(filePath);
  const htmlFilePath = path.join(parentPath, "index.html");
  const mdFilePath = path.join(parentPath, "index.md");
  const docFilePath = (await fse.exists(htmlFilePath))
    ? htmlFilePath
    : (await fse.exists(mdFilePath))
    ? mdFilePath
    : null;
  if (!docFilePath) {
    throw new FixableError(
      `${getRelativePath(
        filePath
      )} can be removed, because it is not located in a folder with a document file.`,
      `rm -i '${getRelativePath(filePath)}'`
    );
  }

  // The image must be mentioned (as a string) in the content
  // Note that it might not be in a <img src> attribute but it could be
  // used in a code example. Either way, it needs to be mentioned by
  // name at least once.
  // Yes, this is pretty easy to fake if you really wanted to, but why
  // bother?
  const rawContent = docFilePath
    ? await fs.readFile(docFilePath, "utf-8")
    : null;
  if (!rawContent.includes(path.basename(filePath))) {
    throw new FixableError(
      `${getRelativePath(
        filePath
      )} can be removed, because it is not mentioned in ${getRelativePath(
        docFilePath
      )}`,
      `rm -i '${getRelativePath(filePath)}'`
    );
  }

  await checkCompression(filePath, options);
}

async function checkCompression(filePath: string, options: CheckerOptions) {
  const tempdir = temporaryDirectory();
  const extension = path.extname(filePath).toLowerCase();
  try {
    const plugins = [];
    if (extension === ".jpg" || extension === ".jpeg") {
      plugins.push(imageminMozjpeg());
    } else if (extension === ".png") {
      plugins.push(imageminPngquant());
    } else if (extension === ".gif") {
      plugins.push(imageminGifsicle());
    } else if (extension === ".svg") {
      plugins.push(imageminSvgo());
    }

    if (!plugins.length) {
      return;
    }

    const files = await imagemin([filePath], {
      destination: tempdir,
      plugins,
      // Needed because otherwise start trying to find files using
      // `globby()` which chokes on file paths that contain brackets.
      // E.g. `/web/css/transform-function/rotate3d()/transform.png`
      // Setting this to false tells imagemin() to just accept what
      // it's given instead of trying to search for the image.
      glob: false,
    });
    if (!files.length) {
      throw new Error(`${filePath} could not be compressed`);
    }
    const compressed = files[0];
    const [sizeBefore, sizeAfter] = (
      await Promise.all([
        fs.stat(filePath),
        fs.stat(compressed.destinationPath),
      ])
    ).map((stat) => stat.size);
    const reductionPercentage = 100 - (100 * sizeAfter) / sizeBefore;

    const formattedBefore = formatSize(sizeBefore);
    const formattedMax = formatSize(MAX_FILE_SIZE);
    const formattedAfter = formatSize(sizeAfter);

    // this check should only be done if we want to save the compressed file
    if (sizeAfter > MAX_FILE_SIZE) {
      throw new Error(
        `${getRelativePath(
          filePath
        )} is too large (${formattedBefore} > ${formattedMax}), even after compressing to ${formattedAfter}.`
      );
    } else if (!options.saveCompression && sizeBefore > MAX_FILE_SIZE) {
      throw new FixableError(
        `${getRelativePath(
          filePath
        )} is too large (${formattedBefore} > ${formattedMax}), but can be compressed to ${formattedAfter}.`,
        `yarn filecheck '${getRelativePath(filePath)}' --save-compression`
      );
    }

    if (reductionPercentage > MAX_COMPRESSION_DIFFERENCE_PERCENTAGE) {
      if (options.saveCompression) {
        console.log(
          `Compressed ${filePath}. New file is ${reductionPercentage.toFixed(
            0
          )}% smaller.`
        );
        fse.copyFileSync(compressed.destinationPath, filePath);
      } else {
        throw new FixableError(
          `${filePath} is ${formatSize(
            sizeBefore
          )} and can be compressed to ${formatSize(
            sizeAfter
          )} (${reductionPercentage.toFixed(0)}%)`,
          `yarn filecheck '${getRelativePath(filePath)}' --save-compression`
        );
      }
    }
  } finally {
    fse.removeSync(tempdir);
  }
}

function canCheckFile(filePath: string) {
  const filePathParts = filePath.split(path.sep);

  return (
    filePathParts.includes("files") &&
    !filePathParts.includes("node_modules") &&
    !/\.(DS_Store|html|json|md|txt|yml)$/i.test(filePath)
  );
}

async function resolveDirectory(file: string): Promise<string[]> {
  const stats = await fs.lstat(file);
  if (stats.isDirectory()) {
    const api = new fdir()
      .withErrors()
      .withFullPaths()
      .filter((filePath) => canCheckFile(filePath))
      .crawl(file);
    return api.withPromise() as Promise<PathsOutput>;
  } else if (stats.isFile() && canCheckFile(file)) {
    return [file];
  } else {
    return [];
  }
}

export async function runChecker(
  filesAndDirectories: string[],
  options: CheckerOptions
) {
  const errors = [];

  const files = (
    await Promise.all(filesAndDirectories.map(resolveDirectory))
  ).flat();

  const progressBar = new cliProgress.SingleBar({ etaBuffer: 100 });
  progressBar.start(files.length, 0);

  await eachLimit(files, os.cpus().length, async (file) => {
    try {
      await checkFile(file, options);
    } catch (error) {
      errors.push(error);
    } finally {
      progressBar.increment();
    }
  });

  progressBar.stop();

  if (errors.length) {
    let msg = errors.map((error) => `${error}`).join("\n");
    const fixableErrors = errors.filter(
      (error) => error instanceof FixableError
    );
    if (fixableErrors.length) {
      const cmds = fixableErrors
        .map((error) => error.fixCommand)
        .sort()
        .join("\n");
      msg += `\n\n${fixableErrors.length} of ${errors.length} errors can be fixed:\n\n${cmds}`;
    }

    throw new Error(msg);
  }
}
