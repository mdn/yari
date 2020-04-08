/**
 * @prettier
 */
const { assert, describeMacro, itMacro } = require('./utils');

describeMacro('TemplateLink', () => {
    itMacro('TemplateLink generates correct DOM', macro => {
        return assert.eventually.equal(
            macro.call('TemplateLink'),
            '<code class="templateLink">' +
                '<a href="https://github.com/mdn/kumascript/tree/master/macros/TemplateLink.ejs">' +
                'TemplateLink' +
                '</a></code>'
        );
    });
});
