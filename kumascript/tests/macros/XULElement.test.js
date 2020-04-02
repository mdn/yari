/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require('./utils');

describeMacro('XULElem', () => {
    for (const locale of ['en-US', 'de', 'fr']) {
        for (const element of ['iframe', 'window']) {
            itMacro(`${locale} ${element}`, macro => {
                macro.ctx.env.locale = locale;
                return assert.eventually.equal(
                    macro.call(element),
                    `<code><a href="/${locale}/docs/Mozilla/Tech/XUL/${element}">&lt;xul:${element}&gt;</a></code>`
                );
            });
        }
    }
});
