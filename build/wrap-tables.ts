// Wraps tables in a scrollable figure to avoid overlapping with the TOC sidebar.
// Before: <table>...</table>
// After: <figure class="table-container"><table>...</table></figure>
export function wrapTables($) {
  const figure = $('<figure class="table-container"></figure>');
  $("table").wrap(figure);
}
