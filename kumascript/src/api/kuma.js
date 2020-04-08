/**
 * @prettier
 */
const url = require('url');
const util = require('./util.js');

module.exports = {
    /**
     * Expose url from node.js to templates
     */
    url: url,
    htmlEscape: util.htmlEscape
};
