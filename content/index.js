import {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  CONTRIBUTOR_SPOTLIGHT_ROOT,
  REPOSITORY_URLS,
  ROOTS,
  VALID_LOCALES,
  HTML_FILENAME,
  MARKDOWN_FILENAME,
} from "./constants";

import Document from "./document";
import Translation from "./translation";
import { getPopularities } from "./popularities";
import Redirect from "./redirect";
import Image from "./image";
import { buildURL, memoize, slugToFolder, execGit, getRoot } from "./utils";
import { resolveFundamental } from "../libs/fundamental-redirects";
import { translationsOf } from "./translations";

export default {
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
