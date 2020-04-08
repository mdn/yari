/**
 * @prettier
 */
const { assert, itMacro, describeMacro, beforeEachMacro } = require('./utils');

// Basic const
const CSS_BASE_SLUG = '/en-US/docs/Web/CSS';

// Template utils
function makeExpect(url, summary, label) {
    if (!summary) return `<a href="${url}"><code>${label}</code></a>`;

    summary = summary.replace(/<[^>]+>/g, '');

    return `<a href="${url}" title="${summary}"><code>${label}</code></a>`;
}

// Mock Pages
// ----------------------------------------------------------------------------
// Those mock pages are expected data return by a call to wiki.getPage
// The `url` is what should be passed to wiki.getPage
// The `data` is the object returned by wiki.getPage
// ----------------------------------------------------------------------------

const MOCK_PAGES = {
    display: {
        url: [CSS_BASE_SLUG, 'display'].join('/'),
        data: {
            summary:
                'The <strong><code>display</code></strong> <a href="/en-US/docs/Web/CSS">CSS</a> property specifies the type of rendering box used for an element.',
            tags: ['CSS', 'CSS Property', 'CSS Display']
        }
    },
    attr: {
        url: [CSS_BASE_SLUG, 'attr'].join('/'),
        data: {
            summary:
                'The <strong><code>attr()</code></strong> <a href="/en-US/docs/Web/CSS">CSS</a> function is used to retrieve the value of an attribute of the selected element and use it in the style sheet.',
            tags: ['CSS', 'Reference', 'Web', 'CSS Function', 'Layout']
        }
    },
    length: {
        url: [CSS_BASE_SLUG, 'length'].join('/'),
        data: {
            summary:
                'The <strong><code>&lt;length&gt;</code></strong> <a href="/en-US/docs/Web/CSS">CSS</a> <a href="/en-US/docs/Web/CSS/CSS_Types">data type</a> represents a distance value.',
            tags: [
                'CSS',
                'Reference',
                'Web',
                'Layout',
                'CSS Data Type',
                'length'
            ]
        }
    },
    color_value: {
        url: [CSS_BASE_SLUG, 'color_value'].join('/'),
        data: {
            summary:
                'The <strong><code>&lt;color&gt;</code></strong> <a href="/en-US/docs/Web/CSS">CSS</a> <a href="/en-US/docs/Web/CSS/CSS_Types">data type</a> represents a color in the <a href="https://en.wikipedia.org/wiki/SRGB" class="external">sRGB color space</a>.',
            tags: ['CSS', 'Reference', 'Web', 'CSS Data Type', 'Layout']
        }
    },
    flex_value: {
        url: [CSS_BASE_SLUG, 'flex_value'].join('/'),
        data: {
            summary:
                'The <strong><code>&lt;flex&gt;</code></strong> <a href="/en-US/docs/Web/CSS">CSS</a> <a href="/en-US/docs/Web/CSS/CSS_Types">data type</a> denotes a flexible length within a grid container.',
            tags: ['CSS', 'Reference', 'Web', 'CSS Data Type', 'Layout']
        }
    },
    position_value: {
        url: [CSS_BASE_SLUG, 'position_value'].join('/'),
        data: {
            summary:
                'The <strong><code>&lt;position&gt;</code></strong> <a href="/en-US/docs/Web/CSS">CSS</a> <a href="/en-US/docs/Web/CSS/CSS_Types">data type</a> denotes a two-dimensional coordinate used to set a location relative to an element box.',
            tags: ['CSS', 'Reference', 'Web', 'CSS Data Type', 'Layout']
        }
    }
};

// Test cases definition
// ----------------------------------------------------------------------------
// Each test case is define by:
// A `title` to make the test understandable by a human behing
// An `input` which is an Array of parameters that will be passed to the macro
// An `output` which is the string that the macro should return
//
// NOTE: we could probably make that more generic by having a single test
//       runner (see below) and a bunch of JSON files (one per macro) to
//       describe all the possible inputs and their expected outputs.
// ----------------------------------------------------------------------------

const TEST_CASE = [
    {
        title: 'One argument (simple property)',
        input: ['display'],
        output: makeExpect(
            MOCK_PAGES.display.url,
            MOCK_PAGES.display.data.summary,
            'display'
        )
    },
    {
        title: 'One argument (CSS function)',
        input: ['attr'],
        output: makeExpect(
            MOCK_PAGES.attr.url,
            MOCK_PAGES.attr.data.summary,
            'attr()'
        )
    },
    {
        title: 'One argument (CSS Data Type)',
        input: ['length'],
        output: makeExpect(
            MOCK_PAGES.length.url,
            MOCK_PAGES.length.data.summary,
            '&lt;length&gt;'
        )
    },
    {
        title: 'One argument (CSS Data Type with angle brackets)',
        input: ['&lt;length&gt;'],
        output: makeExpect(
            MOCK_PAGES.length.url,
            MOCK_PAGES.length.data.summary,
            '&lt;length&gt;'
        )
    },
    {
        title: 'Two arguments (Custom link text)',
        input: ['display', 'display flex'],
        output: makeExpect(
            MOCK_PAGES.display.url,
            'The documentation about this has not yet been written; please consider contributing!',
            // The macro is currently "broken", the expected value should be:
            // MOCK_PAGES.display.data.summary,
            'display flex'
        )
    },
    {
        title: 'Three arguments (Custom link text, with anchor)',
        input: ['display', 'display flex', '#flex'],
        output: makeExpect(MOCK_PAGES.display.url + '#flex', '', 'display flex')
    },
    {
        title: 'Special CSS Data Type: <color>',
        input: ['&lt;color&gt;'],
        output: makeExpect(
            MOCK_PAGES.color_value.url,
            MOCK_PAGES.color_value.data.summary,
            '&lt;color&gt;'
        )
    },
    {
        title: 'Special CSS Data Type: <flex>',
        input: ['&lt;flex&gt;'],
        output: makeExpect(
            MOCK_PAGES.flex_value.url,
            MOCK_PAGES.flex_value.data.summary,
            '&lt;flex&gt;'
        )
    },
    {
        title: 'Special CSS Data Type: <position>',
        input: ['&lt;position&gt;'],
        output: makeExpect(
            MOCK_PAGES.position_value.url,
            MOCK_PAGES.position_value.data.summary,
            '&lt;position&gt;'
        )
    }
];

// Test runner
// ----------------------------------------------------------------------------

describeMacro('cssxref', () => {
    beforeEachMacro(macro => {
        // let's make sure we have a clean calls to wiki.getPage
        macro.ctx.wiki.getPage = jest.fn(url => {
            for (let page of Object.values(MOCK_PAGES)) {
                if (page.url === url) {
                    return page.data;
                }
            }
        });
    });

    TEST_CASE.forEach(test => {
        itMacro(test.title, macro => {
            return assert.eventually.equal(
                macro.call(...test.input),
                test.output
            );
        });
    });
});
