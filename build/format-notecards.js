// Remove h4s from any existing notecards and transform them
// from <div class="note notecard"><h4>Note:</h4>foobar</div> to
// <div class="note notecard"><p><strong>Note:</strong>foobar</p></div>
function formatNotecards($) {
  $(".note.notecard").each(() => {
    const $h4 = $("h4");
    const id = $h4.attr("id");
    const $p = $("p");
    const $replacer = $(`<strong>${$h4.text()}:</strong>`);

    if ($h4.length) {
      $h4.empty();
      $h4.replaceWith($replacer);
      $p.prepend($replacer);

      // if the h4 has id="note" add it as <strong id="note">
      if (id === "note") {
        $replacer.attr("id", id);
      }
    }

    // otherwise leave it be
    return;
  });
}

module.exports = { formatNotecards };
