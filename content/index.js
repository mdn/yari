import {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
  HTML_FILENAME,
  MARKDOWN_FILENAME,
} from "./constants.js";
import * as Document from "./document.js";
import * as Translation from "./translation.js";
import { getPopularities } from "./popularities.js";
import * as Redirect from "./redirect.js";
import * as Image from "./image.js";
import { buildURL, memoize, slugToFolder, execGit, getRoot } from "./utils.js";
import { resolveFundamental } from "../libs/fundamental-redirects/index.js";
import { translationsOf } from "./translations.js";

export {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
  HTML_FILENAME,
  MARKDOWN_FILENAME,

  getPopularities,
  Document,
  Redirect,
  Image,
  Translation,
  buildURL,
  memoize,
  slugToFolder,
  resolveFundamental,
  execGit,
  translationsOf,
  getRoot,
};
