/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require('./utils');

describeMacro('EmbedTest262ReportResultsTable', function() {
    itMacro('Feature Tag: No non-alphabet characters', function(macro) {
        return assert.eventually.equal(
            macro.call('BigInt'),
            '<iframe width="100%" height="300"' +
            ' src="https://test262.report/embed/features/BigInt?engines=chakra%2Cjavascriptcore%2Cspidermonkey%2Cv8&summary=true&include-browsers=true"></iframe>'
        );
    });
    itMacro('Feature Tag: Has a "."', function(macro) {
        return assert.eventually.equal(
            macro.call('Object.fromEntries'),
            '<iframe width="100%" height="300"' +
            ' src="https://test262.report/embed/features/Object.fromEntries?engines=chakra%2Cjavascriptcore%2Cspidermonkey%2Cv8&summary=true&include-browsers=true"></iframe>'
        );
    });
    itMacro('Feature Tag: Has a "-"', function(macro) {
        return assert.eventually.equal(
            macro.call('dynamic-import'),
            '<iframe width="100%" height="300"' +
            ' src="https://test262.report/embed/features/dynamic-import?engines=chakra%2Cjavascriptcore%2Cspidermonkey%2Cv8&summary=true&include-browsers=true"></iframe>'
        );
    });
    itMacro('Feature Tag: Encoded with encodeURIComponent()', function(macro) {
        return assert.eventually.equal(
            macro.call('?dynamic=import/foo&bar'),
            '<iframe width="100%" height="300"' +
            ' src="https://test262.report/embed/features/%3Fdynamic%3Dimport%2Ffoo%26bar?engines=chakra%2Cjavascriptcore%2Cspidermonkey%2Cv8&summary=true&include-browsers=true"></iframe>'
        );
    });
});
