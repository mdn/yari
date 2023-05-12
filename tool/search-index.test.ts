import { htmlStrip } from "./search-index.js";

describe("htmlStrip", () => {
  it("strips basic html tags", () => {
    const html = "<p>Hej då<p>";
    const text = "Hej då";
    const actual = htmlStrip(html);
    expect(actual).toEqual(text);
  });

  it("strips advanced html", () => {
    const html = `<div class="warning">This should get stripped.</div>
<p>Please keep.</p>
<div class="hidden">
<h6 id="Playable_code">Playable code</h6>
</div>
<div style="display: none">This should also get stripped.</div>
<div style="foo:bar;display:none;fun:k">This should also get stripped.</div>
<div style="foo:bar;">Expect to keep this</div>`;
    const text = htmlStrip(html);
    expect(text).not.toContain("This should get stripped");
    expect(text).toContain("Please keep.");
    expect(text).not.toContain("Playable code");
    expect(text).not.toContain("This should also get stripped");
    expect(text).toContain("Expect to keep this");
  });
});
