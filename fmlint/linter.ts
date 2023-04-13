import { LinterOptions, FMConfig, ValidationError } from "./types.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import YAML from "js-yaml";
import _Ajv from "ajv";

import addFormats from "ajv-formats";
import { betterAjvErrors } from "@apideck/better-ajv-errors";

import { eachLimit } from "async";
import cliProgress from "cli-progress";
import { fdir, PathsOutput } from "fdir";

const ORDER = [
  "title",
  "short-title",
  "slug",
  "page-type",
  "status",
  "browser-compat",
  "spec-urls",
];
const FM_RX = /(?<=^---\n)title[\s\S]+?(?=\n---$)/gm;

function getRelativePath(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

function areAttributesInOrder(fm: object): boolean {
  let prevIndex = -1;
  let inOrder = true;
  for (const attribute of Object.keys(fm)) {
    const index = ORDER.indexOf(attribute);
    if (index === -1) {
      continue;
    }
    if (index <= prevIndex) {
      inOrder = false;
      break;
    }
    prevIndex = index;
  }
  return inOrder;
}

export async function checkFrontMatter(
  filePath: string,
  options: LinterOptions
) {
  let content = await fs.readFile(filePath, "utf-8");
  const frontMatter = content.match(FM_RX)[0];
  let fmObject = YAML.load(frontMatter);

  // find a validator for the file path
  let validator = null;
  for (const type of Object.keys(options.validators)) {
    const rx = new RegExp(`^${type}`, "g");
    if (rx.test(fmObject.slug)) {
      validator = options.validators[type];
      break;
    }
  }
  if (validator === null) {
    validator = options.validators["global"];
  }

  // validate and collect errors
  const valid = validator(fmObject);
  const validationErrors: ValidationError[] = betterAjvErrors({
    schema: validator.schema,
    data: fmObject,
    errors: validator.errors,
  });
  const errors = [];
  if (!valid) {
    for (const error of validationErrors) {
      let message = error.message.replace("{base}", "Front matter");
      if (error.context.allowedValues) {
        message += `: \n\t${error.context.allowedValues.join(", ")}`;
      }
      errors.push(message);
    }
  }

  const inOrder = areAttributesInOrder(fmObject);
  let fixableError = null;
  if (!options.fix && !inOrder) {
    fixableError = `${getRelativePath(
      filePath
    )}\n\t Front matter attributes are not in required order: ${ORDER.join(
      "->"
    )}`;
  }

  //  if --fix option is true, fix order and prettify
  if (options.fix) {
    const {
      title,
      "short-title": shortTitle,
      slug,
      "page-type": pageType,
      status,
      "spec-urls": specs,
      "browser-compat": bcd,
    } = fmObject;

    fmObject = { title };

    if (shortTitle) {
      fmObject["short-title"] = shortTitle;
    }

    fmObject["slug"] = slug;

    if (pageType) {
      fmObject["page-type"] = pageType;
    }

    if (status && status?.length) {
      fmObject["status"] = status;
    }

    if (bcd && bcd?.length) {
      if (Array.isArray(bcd) && bcd.length === 1) {
        fmObject["browser-compat"] = bcd[0];
      } else {
        fmObject["browser-compat"] = bcd;
      }
    }

    if (specs && specs?.length) {
      if (Array.isArray(specs) && specs.length === 1) {
        fmObject["spec-urls"] = specs[0];
      } else {
        fmObject["spec-urls"] = specs;
      }
    }

    let yml = YAML.dump(fmObject, {
      skipInvalid: true,
      lineWidth: options.config.lineWidth,
      quotingType: '"',
    });
    yml = yml.replace(/[\s\n]+$/g, "");
    yml = yml.replaceAll("$", "$$$");
    content = content.replace(frontMatter, yml);

    fs.writeFile(filePath, content);
  }

  return [
    errors.length
      ? `Error: ${getRelativePath(filePath)}\n${errors.join("\n")}`
      : null,
    fixableError,
  ];
}

async function resolveDirectory(file: string): Promise<string[]> {
  const stats = await fs.lstat(file);
  if (stats.isDirectory()) {
    const api = new fdir()
      .withErrors()
      .withFullPaths()
      .filter((filePath) => filePath.endsWith("index.md"))
      .crawl(file);
    return api.withPromise() as Promise<PathsOutput>;
  } else if (stats.isFile() && file.endsWith("index.md")) {
    return [file];
  } else {
    return [];
  }
}

// create ajv validators for each document type
function compileValidators(config: FMConfig) {
  const AJV = _Ajv as unknown as typeof _Ajv.default;
  const ajv = new AJV({ allowUnionTypes: true, allErrors: true });
  addFormats.default(ajv);
  const validators = {};

  for (const type of Object.keys(config.allowedPageTypes)) {
    const copy = JSON.parse(JSON.stringify(config.schema));

    copy.properties["page-type"].enum = config.allowedPageTypes[type];
    validators[type] = ajv.compile(copy);
  }
  return validators;
}

// lint front matter
export async function lintFrontMatter(
  filesAndDirectories: string[],
  options: LinterOptions
) {
  const files = (
    await Promise.all(filesAndDirectories.map(resolveDirectory))
  ).flat();

  options.config = JSON.parse(
    await fs.readFile(options.config as any, "utf-8")
  );
  options.validators = compileValidators(options.config);

  const progressBar = new cliProgress.SingleBar({ etaBuffer: 100 });
  progressBar.start(files.length, 0);

  const errors = [];
  const fixableErrors = [];
  await eachLimit(files, os.cpus().length, async (file) => {
    try {
      const [error, fixableError] = await checkFrontMatter(file, options);
      error && errors.push(error);
      fixableError && fixableErrors.push(fixableError);
    } catch (err) {
      errors.push(err);
    } finally {
      progressBar.increment();
    }
  });
  progressBar.stop();
  console.log(errors.length, fixableErrors.length);
  if (errors.length || fixableErrors.length) {
    let msg = errors.map((error) => `${error}`).join("\n\n");

    if (fixableErrors.length) {
      msg +=
        "\n\nFollowing fixable errors can be fixed using '--fix true' option\n";
      msg += fixableErrors.map((error) => `${error}`).join("\n");
    }
    throw new Error(msg);
  }
}
