/**
 * @prettier
 */

const { assert, itMacro, describeMacro, beforeEachMacro } = require('./utils');
const jsdom = require('jsdom');

/*
Locales dictionary is included for completeness,
although this macro isn't localized yet.
*/
const locales = {
    'en-US': {
        Description: 'Description',
        Name: 'Name',
        JavaScript_APIs: 'JavaScript APIs'
    },
    fr: {
        Description: 'Description',
        Name: 'Name',
        JavaScript_APIs: 'JavaScript APIs'
    }
};

const testExamplesJson = [
    {
        description: 'An example WebExtension.',
        javascript_apis: [
            'storage.local',
            'tabs.onActivated',
            'tabs.onUpdated',
            'tabs.query',
            'windows.getCurrent'
        ],
        name: 'example-one'
    },
    {
        description: 'Another example WebExtension.',
        javascript_apis: [],
        name: 'example-two'
    }
];

const expectedExtensionBaseUrl =
    'https://github.com/mdn/webextensions-examples/tree/master/';
const expectedJsApiBaseUrl = '/Add-ons/WebExtensions/API/';

function checkTableDom(dom, locale) {
    // 1. check the table headers
    let tableHeaders = dom.querySelectorAll('th');
    assert.equal(tableHeaders.length, 3, 'Incorrect number of <th> elements');
    // 1.1 name header
    let nameHeader = tableHeaders[0];
    assert.equal(
        nameHeader.textContent,
        locales[locale].Name,
        'Incorrect name for Name table header'
    );
    // 1.2 description header
    let descHeader = tableHeaders[1];
    assert.equal(
        descHeader.textContent,
        locales[locale].Description,
        'Incorrect name for Description table header'
    );
    // 1.3 JS APIs header
    let jsAPIHeader = tableHeaders[2];
    assert.equal(
        jsAPIHeader.textContent,
        locales[locale].JavaScript_APIs,
        'Incorrect name for JS API table header'
    );
    assert.equal(
        jsAPIHeader.style.width,
        '40%',
        'Incorrect or missing style for JS API table header'
    );

    let tableRows = dom.querySelectorAll('tr');
    assert.equal(tableRows.length, 3, 'Incorrect number of <tr> elements');

    // 2. check the first row
    let row1Cells = tableRows[1].querySelectorAll('td');
    assert.equal(row1Cells.length, 3, 'Incorrect number of <td> elements');

    // 2.1 name cell
    let name1 = row1Cells[0];
    assert.equal(
        name1.textContent,
        'example-one',
        'Incorrect name for example 1'
    );
    let extensionLink = name1.querySelector('a');
    assert.equal(
        extensionLink.href,
        `${expectedExtensionBaseUrl}example-one`,
        'Incorrect link for example 1'
    );

    // 2.2 description cell
    let description1 = row1Cells[1];
    assert.equal(
        description1.textContent,
        'An example WebExtension.',
        'Incorrect description for example 1'
    );

    // 2.3 js APIs cell
    let jsAPIs1 = row1Cells[2];
    let jsAPIsLinks1 = jsAPIs1.querySelectorAll('a');
    assert.equal(
        jsAPIsLinks1.length,
        5,
        'Incorrect number of API links for example 1'
    );
    assert.equal(
        jsAPIsLinks1[0].href,
        `/${locale}${expectedJsApiBaseUrl}storage/local`,
        'Incorrect link for JS API'
    );

    // 3. check that the second example has an empty JS API cell
    let row2Cells = tableRows[2].querySelectorAll('td');
    let jsAPIs2 = row2Cells[2];
    let jsAPIsLinks2 = jsAPIs2.querySelectorAll('a');
    assert.equal(
        jsAPIsLinks2.length,
        0,
        'Incorrect number of API links for example 2'
    );
}

describeMacro('WebExtAllExamples', function() {
    beforeEachMacro(function(macro) {
        macro.ctx.mdn.fetchJSONResource = jest.fn(
            async url => testExamplesJson
        );
    });

    itMacro('Creates an examples table for en-US', function(macro) {
        macro.ctx.env.locale = 'en-US';
        return macro.call().then(function(result) {
            let dom = jsdom.JSDOM.fragment(result);
            checkTableDom(dom, 'en-US');
        });
    });

    itMacro('Creates an examples table for fr', function(macro) {
        macro.ctx.env.locale = 'fr';
        macro.ctx.allExamples = testExamplesJson;
        return macro.call().then(function(result) {
            let dom = jsdom.JSDOM.fragment(result);
            checkTableDom(dom, 'fr');
        });
    });
});
