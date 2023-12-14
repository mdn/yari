import Environment, { KumaThis } from "../../src/environment.js";
import { getCSSSyntax } from "../../src/lib/css-syntax.js";

async function render(slug: string, pageType: string) {
  const environment = new Environment({
    locale: "en-US",
    slug,
    "page-type": pageType,
  });
  const context = environment.getExecutionContext([]) as KumaThis;
  return await getCSSSyntax(context);
}

describe("CSSSyntax", () => {
  it("renders at-rule", async () => {
    expect(await render("Web/CSS/@import", "css-at-rule")).toMatchSnapshot(
      "@import"
    );
  });

  it("renders at-rule-descriptor", async () => {
    expect(
      await render("Web/CSS/@font-face/src", "css-at-rule-descriptor")
    ).toMatchSnapshot("@font-face/src");
  });

  it("renders function", async () => {
    expect(await render("Web/CSS/sin", "css-function")).toMatchSnapshot("sin");
  });

  it("renders property", async () => {
    expect(await render("Web/CSS/box-shadow", "css-property")).toMatchSnapshot(
      "box-shadow"
    );
  });

  it("renders shorthand-property", async () => {
    expect(
      await render("Web/CSS/overflow", "css-shorthand-property")
    ).toMatchSnapshot("overflow");
  });

  it("renders type", async () => {
    expect(await render("Web/CSS/ratio", "css-type")).toMatchSnapshot("ratio");
    expect(await render("Web/CSS/alpha-value", "css-type")).toMatchSnapshot(
      "alpha-value"
    );
  });
});
