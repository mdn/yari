// Wraps tables in a scrollable div to avoid overlapping with the TOC sidebar.
// Before: <table>...</table>
// After: <div class="table-scroll"><table>...</table></div>
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'wrapTables... Remove this comment to see the full error message
function wrapTables($) {
  const div = $('<div class="table-scroll"></div>');
  $("table").wrap(div);
}

module.exports = { wrapTables };
