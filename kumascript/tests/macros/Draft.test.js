/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require("./utils");
const { JSDOM } = require("jsdom");

describeMacro("Draft", () => {
  itMacro("No arguments (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Draft</h4>\n    <p>This page is not complete.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (es)", function (macro) {
    macro.ctx.env.locale = "es";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Borrador</h4>\n    <p>Esta página no está completa.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (fr)", function (macro) {
    macro.ctx.env.locale = "fr";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Brouillon</h4>\n    <p>Cette page n&#39;est pas terminée.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (ja)", function (macro) {
    macro.ctx.env.locale = "ja";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>草案</h4>\n    <p>このページは完成していません。</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (ko)", function (macro) {
    macro.ctx.env.locale = "ko";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>초안</h4>\n    <p>이 문서는 작성중입니다.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (pl)", function (macro) {
    macro.ctx.env.locale = "pl";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Szkic</h4>\n    <p>Strona ta nie jest jeszcze ukończona.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (zh-CN)", function (macro) {
    macro.ctx.env.locale = "zh-CN";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>草案</h4>\n    <p>本页尚未完工.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (zh-TW)", function (macro) {
    macro.ctx.env.locale = "zh-TW";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>編撰中</h4>\n    <p>本頁仍未完成</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (pt-PT)", function (macro) {
    macro.ctx.env.locale = "pt-PT";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Esboço</h4>\n    <p>Esta página está incompleta.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (pt-BR)", function (macro) {
    macro.ctx.env.locale = "pt-BR";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Rascunho</h4>\n    <p>Esta página está incompleta.</p>\n    \n</div>`
    );
  });

  itMacro("No arguments (ru)", function (macro) {
    macro.ctx.env.locale = "ru";
    return assert.eventually.equal(
      macro.call(),
      `<div class="notecard draft">\n    <h4>Черновик</h4>\n    <p>Эта страница не завершена.</p>\n    \n</div>`
    );
  });

  itMacro("One argument (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call("The reason is shrouded in mystery (escattone)."),
      `<div class="notecard draft">\n    <h4>Draft</h4>\n    <p>This page is not complete.</p>\n    <em>The reason is shrouded in mystery (escattone).</em>\n</div>`
    );
  });

  itMacro(
    "One argument with embedded user profile in the middle (escattone) (en-US)",
    (macro) => {
      return macro
        .call("The reason is shrouded in mystery (~~escattone).")
        .then((result) => {
          const dom = JSDOM.fragment(result);
          expect(dom.childElementCount).toBeGreaterThanOrEqual(1);
          assert(
            dom.firstElementChild.classList.contains("notecard"),
            "Root element is a 'notecard'"
          );
          assert(
            dom.firstElementChild.classList.contains("draft"),
            "Root element is a 'draft'"
          );

          const header = dom.querySelector("h4");
          // Block indicator has a header
          expect(header).toEqual(expect.anything());
          assert.equal(header.textContent.trim(), "Draft");

          /** @type {HTMLAnchorElement} */
          const anchor = dom.querySelector('a[href*="/profiles/"]');
          // Draft details has a user profile link
          expect(anchor).toEqual(expect.anything());
          assert.include(anchor.href, "/profiles/escattone");

          expect(dom.querySelector("em").textContent).toEqual(
            "The reason is shrouded in mystery (escattone)."
          );
        });
    }
  );

  itMacro(
    "One argument with embedded user profile at the end (stephaniehobson) (en-US)",
    (macro) => {
      return macro
        .call("{{Draft}} macro test. ~~stephaniehobson")
        .then((result) => {
          const dom = JSDOM.fragment(result);
          expect(dom.childElementCount).toBeGreaterThanOrEqual(1);
          assert(
            dom.firstElementChild.classList.contains("notecard"),
            "Root element is a 'notecard'"
          );
          assert(
            dom.firstElementChild.classList.contains("draft"),
            "Root element is a 'draft'"
          );

          const header = dom.querySelector("h4");
          // Block indicator has a header
          expect(header).toEqual(expect.anything());
          assert.equal(header.textContent.trim(), "Draft");

          /** @type {HTMLAnchorElement} */
          const anchor = dom.querySelector('a[href*="/profiles/"]');
          // Draft details has a user profile link
          expect(anchor).toEqual(expect.anything());
          assert.include(anchor.href, "/profiles/stephaniehobson");

          expect(dom.querySelector("em").textContent).toEqual(
            "{{Draft}} macro test. stephaniehobson"
          );
        });
    }
  );

  itMacro(
    "One argument with embedded user profile at the end (ExE-Boss) (en-US)",
    (macro) => {
      return macro.call("{{Draft}} macro test. ~~ExE-Boss").then((result) => {
        const dom = JSDOM.fragment(result);
        expect(dom.childElementCount).toBeGreaterThanOrEqual(1);
        assert(
          dom.firstElementChild.classList.contains("notecard"),
          "Root element is a 'notecard'"
        );
        assert(
          dom.firstElementChild.classList.contains("draft"),
          "Root element is a 'draft'"
        );

        const header = dom.querySelector("h4");
        // Block indicator has a header
        expect(header).toEqual(expect.anything());
        assert.equal(header.textContent.trim(), "Draft");

        /** @type {HTMLAnchorElement} */
        const anchor = dom.querySelector('a[href*="/profiles/"]');
        // Draft details has a user profile link
        expect(anchor).toEqual(expect.anything());
        assert.include(anchor.href, "/profiles/ExE-Boss");

        expect(dom.querySelector("em").textContent).toEqual(
          "{{Draft}} macro test. ExE-Boss"
        );
      });
    }
  );
});
