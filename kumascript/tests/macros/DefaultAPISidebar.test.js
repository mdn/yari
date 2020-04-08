/**
 * @prettier
 */
const { JSDOM } = require('jsdom');

const {
    beforeEachMacro,
    describeMacro,
    itMacro,
    lintHTML
} = require('./utils');

/**
* Load all the fixtures.
*/
const fs = require('fs');
const path = require('path');
const pagesFixturePath = path.resolve(__dirname, 'fixtures/defaultapisidebar/pages.json');
const pagesJSON = JSON.parse(fs.readFileSync(pagesFixturePath, 'utf8'));
const subpagesJSON = [
    pagesJSON['/en-US/docs/Web/API/TestInterface_API/MyGuidePage1'],
    pagesJSON['/en-US/docs/Web/API/TestInterface_API/MyGuidePage2']
];
const commonl10nFixturePath = path.resolve(__dirname, 'fixtures/defaultapisidebar/commonl10n.json');
const commonl10nFixture = fs.readFileSync(commonl10nFixturePath, 'utf8');
const commonL10nJSON = JSON.parse(commonl10nFixture);
const groupDataFixturePath = path.resolve(__dirname, 'fixtures/defaultapisidebar/groupdata.json');
const groupDataFixture = fs.readFileSync(groupDataFixturePath, 'utf8');

/**
* All the const objects that follow define bits of the data we expect.
**/

/**
* Map link names to link targets
* (excluding locales, which the checker adds as a prefix)
*/
const expectedTargets = {
    // overview page
    'TestInterface1 API': '/docs/Web/API/TestInterface1_API',
    'TestInterface2 API': '/docs/Web/API/TestInterface2_API',
    'TestInterface3 API': '/docs/Web/API/TestInterface3_API',
    // guides
    'A Guide in another place': '/docs/Web/AnotherPlace/A_guide',
    'A Guide which is a subpage': 'docs/Web/API/TestInterface_API/MyGuidePage2',
    'A Guide which is also a subpage': '/docs/Web/API/TestInterface_API/MyGuidePage1',
    // interfaces
    'AnInterface': '/docs/Web/API/AnInterface',
    'AnotherInterface': '/docs/Web/API/AnotherInterface',
    // methods
    'AnInterface.doSomething()': '/docs/Web/API/AnInterface/doSomething',
    'ADifferentInterface.doSomething()': '/docs/Web/API/ADifferentInterface/doSomething',
    'YetAnotherInterface.doSomething()': '/docs/Web/API/YetAnotherInterface/doSomething',
    // properties
    'ADifferentInterface.aProperty': '/docs/Web/API/ADifferentInterface/aProperty',
    'ADifferentInterface.anotherProperty': '/docs/Web/API/ADifferentInterface/anotherProperty',
    // events
    'aEvent: properlyFormatted': '/docs/Web/API/aEvent/properlyFormatted_event',
    'bEvent: properlyFormatted': '/docs/Web/API/bEvent/properlyFormatted_event'
}

/**
* Data for guide links is more complex because (when the guides are
* found from subpages rather than GroupData) it is
* locale-sensitive and contains title attributes.
*/
const expectedGuides = {
    'en-US': {
        'A Guide in another place': {
            text: 'A Guide in another place',
            target: '/en-US/docs/Web/AnotherPlace/A_guide'
        },
        'A Guide listed in GroupData and also a subpage': {
            text: 'A Guide listed in GroupData and also a subpage',
            target: '/en-US/docs/Web/API/TestInterface_API/MyGuidePage1',
            title: 'The MyGuidePage1 ...'
        }
    },
    'fr':  {
        'A Guide in another place': {
            text: 'A Guide in another place [Traduire]',
            target: '/fr/docs/Web/AnotherPlace/A_guide'
        },
        'A Guide listed in GroupData and also a subpage': {
            text: 'A Guide listed in GroupData and also a subpage [Traduire]',
            target: '/fr/docs/Web/API/TestInterface_API/MyGuidePage1',
            title: 'The MyGuidePage1 ...'
        }
    },
    'ja':  {
        'A Guide in another place': {
            text: 'A Guide in another place (ja translation)',
            target: '/ja/docs/Web/AnotherPlace/A_guide'
        },
        'A Guide listed in GroupData and also a subpage': {
            text: 'A Guide listed in GroupData and also a subpage (ja translation)',
            target: '/ja/docs/Web/API/TestInterface_API/MyGuidePage1',
            title: 'The MyGuidePage1 ... (ja translation).'
        }
    }
}

/**
* Different expected sidebar contents, one for each test
*/
const expectedSideBarContents = {
    'TestInterface1_WithSubpages': {
        'overview': 'TestInterface1 API',
        details: {
            Interfaces: ['AnInterface'],
            Methods: ['ADifferentInterface.doSomething()', 'YetAnotherInterface.doSomething()']
        }
    },
    'TestInterface2_WithSubpages': {
        'overview':   'TestInterface2 API',
        details: {
            Guides: ['A Guide in another place'],
            Interfaces: ['AnInterface'],
            Methods: ['ADifferentInterface.doSomething()', 'YetAnotherInterface.doSomething()'],
            Properties: ['ADifferentInterface.aProperty', 'ADifferentInterface.anotherProperty'],
            Events: ['aEvent: properlyFormatted']
        }
    },
    'TestInterface3_WithSubpages': {
        'overview': 'TestInterface3 API',
        details: {
            Guides: ['A Guide in another place', 'A Guide listed in GroupData and also a subpage'],
            Interfaces: ['AnInterface', 'AnotherInterface'],
            Properties: ['ADifferentInterface.aProperty']
        }
    },
    'TestInterface4_WithSubpages': {
        details: {
            Guides: ['A Guide in another place'],
            Interfaces: ['AnInterface', 'AnotherInterface'],
            Properties: ['ADifferentInterface.aProperty'],
            Events: ['aEvent: properlyFormatted', 'bEvent: properlyFormatted']
        }
    },
    'TestInterface1_NoSubpages': {
        'overview':   'TestInterface1 API',
        details: {
            Interfaces: ['AnInterface'],
            Methods: ['ADifferentInterface.doSomething()', 'YetAnotherInterface.doSomething()']
        }
    },
    'TestInterface2_NoSubpages': {
        'overview':   'TestInterface2 API',
        details: {
            Guides: ['A Guide in another place'],
            Interfaces: ['AnInterface'],
            Methods: ['ADifferentInterface.doSomething()', 'YetAnotherInterface.doSomething()'],
            Properties: ['ADifferentInterface.aProperty', 'ADifferentInterface.anotherProperty'],
            Events: ['aEvent: properlyFormatted']
       }
    }
}

/**
* This is the checker for all items except for guide items.
* It just compares:
* - the DOM element's textContent with expected,
* - the `a.href` with the expected target, which it gets from
* the `expectedTargets` map.
*/
function checkItem(expected, actual, locale) {
    // Check the textContent
    expect(actual.textContent).toEqual(expected);
    // Check the target
    const itemLink = actual.querySelector('a');
    const expectedTarget = expectedTargets[expected];
    expect(itemLink.href).toEqual(`/${locale}${expectedTarget}`);
}

/**
* Guide items need special treatment because they
* are locale-sensitive sometimes, and sometimes include a title
* attribute which we have to check.
*/
function checkGuideItem(expected, actual, locale) {
    // Check the textContent
    const expectedItem = expectedGuides[locale][expected];
    expect(actual.textContent).toEqual(expectedItem.text);
    // Check the target
    const itemLink = actual.querySelector('a');
    expect(itemLink.href).toEqual(expectedItem.target);
    // Check the title
    if (expectedItem.title) {
        expect(itemLink.getAttribute('title')).toEqual(expectedItem.title);
    }
}

/**
* Check a subsection of the sidebar, represented as a <details> element
* containing a <summary> and a list of links.
*/
function checkSubList(name, config, details, checker, next) {
    const hasSubList = config.expected.details[name];
    if (hasSubList) {
        // Check the summary
        const expectedSummary = commonL10nJSON[name][config.locale];
        const actual = details[next];
        const actualSummary = actual.querySelector('summary');
        expect(actualSummary.textContent).toEqual(expectedSummary);
        // Check the list
        const actualItems = actual.querySelectorAll('ol>li');
        const expectedItems = config.expected.details[name];
        expect(actualItems.length).toEqual(expectedItems.length);
        for (let i = 0; i < actualItems.length; i++) {
            checker(expectedItems[i], actualItems[i], config.locale);
        }
        next++;
    }
    return next;
}

/**
* This is the entry point for checking the result of a test.
* config.expected contains the expected results, and we use other bits
* of config, most notably locale.
*/
function checkResult(html, config) {
    // Lint the HTML
    expect(lintHTML(html)).toBeFalsy();

    const dom = JSDOM.fragment(html);
    // Check that all links reference the proper locale or use https
    const num_total_links = dom.querySelectorAll('a[href]').length;
    const num_valid_links = dom.querySelectorAll(`a[href^="/${config.locale}/"], a[href^="https://"]`).length;
    expect(num_valid_links).toEqual(num_total_links);

    if (config.expected.overview) {
        // Test overview link
        const overviewLink = dom.querySelector('ol>li>strong');
        checkItem(config.expected.overview, overviewLink, config.locale);
    }

    // Test sublists
    const details = dom.querySelectorAll('ol>li>details');
    expect(details.length).toEqual(Object.keys(config.expected.details).length);
    let next = 0;
    next = checkSubList('Guides', config, details, checkGuideItem, next);
    next = checkSubList('Interfaces', config, details, checkItem, next);
    next = checkSubList('Properties', config, details, checkItem, next);
    next = checkSubList('Methods', config, details, checkItem, next);
    checkSubList('Events', config, details, checkItem, next);
}

/**
* Call the macro for each of three locales,
* using the given config, and check the result.
*/
function testMacro(config) {
    for (const locale of ['en-US', 'fr', 'ja']) {
        let testName = `${config.name}; locale: ${locale}`;
        itMacro(testName, function(macro) {
            config.locale = locale;
            macro.ctx.env.locale = locale;
            // Mock calls to MDN.subpagesExpand
            macro.ctx.page.subpagesExpand = jest.fn((page) => {
                return config.subpages;
            });
            return macro.call(config.argument).then(function(result) {
                checkResult(result, config);
            });

        });
    }
}

describeMacro('DefaultAPISidebar', function() {

    // Set any fixtures that don't change from one
    // test to another
    beforeEachMacro(function(macro) {
        // env.slug only has to be truthy
        macro.ctx.env.slug = 'not undefined';
        // Mock calls to L10n-Common and GroupData
        const originalTemplate = macro.ctx.template;
        macro.ctx.template = jest.fn( async (name, ...args) => {
            if (name === "L10n:Common") {
                return commonl10nFixture;
            }
            if (name === "GroupData") {
                return groupDataFixture;
            }
            return await originalTemplate(name, ...args);
        });
        // Mock calls to wiki.getPage()
        macro.ctx.wiki.getPage = jest.fn( async (url) => {
            return pagesJSON[url];
        });
    });

    // Run each test case with its own config
    testMacro({
        name: 'Text Interface 1 with subpages',
        argument: 'TestInterface1',
        subpages: subpagesJSON,
        expected: expectedSideBarContents.TestInterface1_WithSubpages
    });

    testMacro({
        name: 'Text Interface 2 with subpages',
        argument: 'TestInterface2',
        subpages: subpagesJSON,
        expected: expectedSideBarContents.TestInterface2_WithSubpages
    });

    testMacro({
        name: 'Text Interface 3 with subpages',
        argument: 'TestInterface3',
        subpages: subpagesJSON,
        expected: expectedSideBarContents.TestInterface3_WithSubpages
    });

    testMacro({
        name: 'Text Interface 4 with subpages',
        argument: 'TestInterface4',
        subpages: subpagesJSON,
        expected: expectedSideBarContents.TestInterface4_WithSubpages
    });

    testMacro({
        name: 'Text Interface 1 with no subpages',
        argument: 'TestInterface1',
        subpages: [],
        expected: expectedSideBarContents.TestInterface1_NoSubpages
    });

    testMacro({
        name: 'Text Interface 2 with no subpages',
        argument: 'TestInterface2',
        subpages: [],
        expected: expectedSideBarContents.TestInterface2_NoSubpages
    });

});
