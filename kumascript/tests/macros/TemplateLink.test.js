/**
 * @prettier
 */
import { assert, describeMacro, itMacro } from "./utils";

describeMacro("TemplateLink", () => {
  itMacro("TemplateLink generates correct DOM", (macro) => {
    return assert.eventually.equal(
      macro.call("TemplateLink"),
      '<code class="templateLink">' +
        '<a href="https://github.com/mdn/yari/tree/main/kumascript/macros/TemplateLink.ejs">' +
        "TemplateLink" +
        "</a></code>"
    );
  });
});
