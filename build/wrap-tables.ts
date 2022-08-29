// Wraps tables in a scrollable div to avoid overlapping with the TOC sidebar.
// Before: <table>...</table>
// After: <div class="table-scroll"><table>...</table></div>
export function wrapTables($) {
  const div = $('<div class="table-scroll"></div>');
  $("table").wrap(div);
}
