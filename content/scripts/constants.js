const path = require("path");
require("dotenv").config();

const DEFAULT_ROOT = process.env.ROOT || path.join(__dirname, "..", "files");
const DEFAULT_DESTINATION =
  process.env.ROOT || path.join(__dirname, "..", "build");

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL || "mysql2://username:password@host/databasename";

const DEFAULT_EXCLUDE_SLUG_PREFIXES = [
  "User:",
  "Talk:",
  "User_talk:",
  "Template_talk:",
  "Project_talk:",
  "Experiment:"
];

module.exports = {
  DEFAULT_ROOT,
  DEFAULT_DESTINATION,
  DEFAULT_DATABASE_URL,
  DEFAULT_EXCLUDE_SLUG_PREFIXES
};
