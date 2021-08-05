// Remove h4s from any existing notecards and transform them
// from <div class="note notecard"><h4>Note:</h4>foobar</div> to
// <div class="note notecard"><p><strong>Note:</strong>foobar</p></div>
function formatNotecards($) {
  $("div.notecard h4").each((_, element) => {
    const h4 = $(element);
    const text = h4.text();
    const p = $("p:first", h4.parents("div.notecard"));
    p.html(`<strong>${text}:</strong> ${p.html()}`);
    h4.remove();
  });
}

module.exports = { formatNotecards };
