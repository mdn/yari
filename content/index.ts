import Document from "./document";
import Translation from "./translation";
import { getPopularities } from "./popularities";
import Redirect from "./redirect";
import Image from "./image";
import { buildURL, memoize, slugToFolder, execGit, getRoot } from "./utils";
import { resolveFundamental } from "../libs/fundamental-redirects";
import { translationsOf } from "./translations";

module.exports = {
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
