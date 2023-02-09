import { Program } from "@caporal/core";

import { addRedirectCommand } from "./add-redirect.js";
import { buildRobotsTxtCommand } from "./build-robots-txt.js";
import { fixRedirectsCommand } from "./fix-redirects.js";
import { createCommand } from "./create.js";
import { deleteCommand } from "./delete.js";
import { editCommand } from "./edit.js";
import { moveCommand } from "./move.js";
import { fixFlawsCommand } from "./fix-flaws.js";
import { flawsCommand } from "./flaws.js";
import { gatherGitHistoryCommand } from "./gather-git-history.js";
import { googleAnalyticsCodeCommand } from "./google-analytics-code.js";
import { inventoryCommand } from "./inventory.js";
import { macroUsageReportCommand } from "./macro-usage-report.js";
import { optimizeClientBuildCommand } from "./optimize-client-build.js";
import { popularitiesCommand } from "./popularities.js";
import { previewCommand } from "./preview.js";
import { redundantTranslationsCommand } from "./redundant-translations.js";
import { spasCommand } from "./spas.js";
import { syncTranslatedContentCommand } from "./sync-translated-content.js";
import { testRedirectsCommand } from "./test-redirects.js";
import { validateCommand } from "./validate.js";
import { validateRedirectsCommand } from "./validate-redirects.js";

const commands = [
  validateRedirectsCommand,
  testRedirectsCommand,
  addRedirectCommand,
  fixRedirectsCommand,
  deleteCommand,
  moveCommand,
  editCommand,
  createCommand,
  validateCommand,
  previewCommand,
  gatherGitHistoryCommand,
  syncTranslatedContentCommand,
  fixFlawsCommand,
  flawsCommand,
  redundantTranslationsCommand,
  popularitiesCommand,
  googleAnalyticsCodeCommand,
  buildRobotsTxtCommand,
  spasCommand,
  inventoryCommand,
  optimizeClientBuildCommand,
  macroUsageReportCommand,
];

export function addCommands(program: Program) {
  commands.forEach((addCommand) => addCommand(program));

  return program;
}
