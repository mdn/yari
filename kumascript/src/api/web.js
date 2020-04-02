/**
 * @prettier
 */
const util = require('./util.js');

module.exports = {
    // Insert a hyperlink.
    link(uri, text, title, target) {
        var out = [
            '<a href="' + util.spacesToUnderscores(util.htmlEscape(uri)) + '"'
        ];
        if (title) {
            out.push(' title="' + util.htmlEscape(title) + '"');
        }
        if (target) {
            out.push(' target="' + util.htmlEscape(target) + '"');
        }
        out.push('>', util.htmlEscape(text || uri), '</a>');
        return out.join('');
    },

    // Given a URL, convert all spaces to underscores. This lets us fix a
    // bunch of places where templates assume this is done automatically
    // by the API, like MindTouch did.
    spacesToUnderscores(str) {
        return util.spacesToUnderscores(str);
    }
};
