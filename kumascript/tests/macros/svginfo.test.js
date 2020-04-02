/**
 * @prettier
 */

const { assert, itMacro, describeMacro, beforeEachMacro } = require('./utils');

// Basic const
const SVG_DATA = require('../../macros/SVGData.json');
const L10N_SVG = require('../../macros/L10n-SVG.json');
const L10N_COMMON = require('../../macros/L10n-Common.json');
const SVG_BASE_SLUG = 'docs/Web/SVG';

// UTILITIES
// ----------------------------------------------------------------------------
// NOTE: Maybe it would worth having those in a separate module
//       if we want to deal with the same stuff in other tests.
// ----------------------------------------------------------------------------

// Handle l10n mechanics
//
// @param key    The key of the string to localize
// @param locale The locale into which the key must be translated
// @return <string>
function _(key, locale) {
    if (typeof key === 'object' && key !== null && !Array.isArray(key))
        return key[locale] || '';

    key = String(key);

    if (key in L10N_SVG)
        return L10N_SVG[key][locale] || L10N_SVG[key]['en-US'] || '';

    if (key in L10N_COMMON)
        return L10N_COMMON[key][locale] || L10N_COMMON[key]['en-US'] || '';

    // No matter what that macro must return a string
    return '';
}

// Build an absolute URL by concatenating the arguments.
function URL(...chunks) {
    return '/' + chunks.join('/');
}

// Turn a camelCase string into a snake_case string
//
// @param str     <string>  The string to transform
// @param upFirst <boolean> Indicate is the first letter must be upper cased (true by default)
// @return <string>
function camelToSnake(str, upFirst = true) {
    str = str.replace(/[A-Z]/g, match => '_' + match.toLowerCase());

    if (upFirst) str = str.replace(/^./, match => match.toUpperCase());

    return str;
}

// Extract the summary of a given page in a given locale if it exists
//
// @param key    <string>  The key of the page to retrieve
// @param locale <string>  The locale in which the summary must be provided
// @param clean  <boolean> Indicate if HTML tags must be striped (true by default)
// @return <string>
function getSummary(key, locale, clean = true) {
    if (
        !MOCK_PAGES[locale] ||
        !MOCK_PAGES[locale][key] ||
        !MOCK_PAGES[locale][key].data ||
        !MOCK_PAGES[locale][key].data.summary
    )
        return '';

    var str = MOCK_PAGES[locale][key].data.summary;

    if (clean) str = str.replace(/<[^>]+>/g, '');

    return str;
}

// Test utilities
// ----------------------------------------------------------------------------
// Set up expected output based on the expected input data
function makeExpect(data, locale = 'en-US') {
    const CONTENT = _('permittedContent', locale);
    const SEPARATOR = _('listSeparator', locale);
    const CATEGORIES = _('categories', locale);
    const DESCRIPTION = _(data.content.description, locale);

    // Set the list of categories that apply to the element
    const categories = data.categories
        .map(value => _(value, locale))
        .join(SEPARATOR);

    // Set the list of permitted content that apply to the element
    const permittedContent = [DESCRIPTION];

    if (data.content.elements) {
        // Regroup permitted content between named groups and standalone elements
        let { elements, groups } = data.content.elements.reduce(
            (acc, value) => {
                if (value.indexOf('&lt;') !== -1) {
                    let key = value.replace(/&lt;|&gt;/g, '');
                    let url = URL(locale, SVG_BASE_SLUG, 'Element', key);
                    let summary = getSummary(key, locale);

                    acc.elements.push(
                        `<a href="${url}"  title="${summary}"><code>${value}</code></a>`
                    );
                } else {
                    let anchor = '#' + camelToSnake(value);
                    let label = _(value, locale);
                    let url = URL(locale, SVG_BASE_SLUG, 'Element') + anchor;

                    acc.groups.push(`<a href="${url}">${label}</a>`);
                }

                return acc;
            },
            { elements: [], groups: [] }
        );

        // Named groups must be listed first (each on new lines)
        if (groups.length > 0) permittedContent.push(groups.join('<br/>'));

        // Standalone elements must be listed as a comma separated
        // list (the exact separator is l10n driven)
        if (elements.length > 0)
            permittedContent.push(elements.join(SEPARATOR));
    }

    var output = [
        '<table class="properties">',
        '<tbody>',
        '<tr>',
        '<th scope="row">',
        CATEGORIES,
        '</th>',
        '<td>',
        categories,
        '</td>',
        // '</tr>',
        '<tr>',
        '<th scope="row">',
        CONTENT,
        '</th>',
        '<td>',
        permittedContent.join('<br/>'),
        '</td>',
        // '</tr>',
        '</tbody>',
        '</table>'
    ];

    return output.join('');
}

// Mock Pages
// ----------------------------------------------------------------------------
// Those mock pages are expected data return by a call to wiki.getPage
// The `url` is what should be passed to wiki.getPage
// The `data` is the object returned by wiki.getPage
// ----------------------------------------------------------------------------

const MOCK_PAGES = {
    'en-US': {
        a: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'a'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>&lt;a&gt;</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        altGlyphDef: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'altGlyphDef'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>altGlyphDef</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        clipPath: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'clipPath'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>clipPath</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        'color-profile': {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'color-profile'].join(
                '/'
            ),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>color</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        cursor: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'cursor'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>cursor</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        filter: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'filter'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>filter</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        font: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'font'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>font</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        'font-face': {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'font-face'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>font</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        foreignObject: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'foreignObject'].join(
                '/'
            ),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>foreignObject</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        image: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'image'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>image</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        marker: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'marker'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>marker</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        mask: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'mask'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>mask</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        pattern: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'pattern'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>pattern</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        script: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'script'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>script</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        style: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'style'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>style</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        switch: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'switch'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>switch</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        text: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'text'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>text</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        },
        view: {
            url: ['/en-US', SVG_BASE_SLUG, 'Element', 'view'].join('/'),
            data: {
                summary:
                    'This is a mock for the SVG <strong><code>view</code></strong> element.',
                tags: ['SVG', 'Element']
            }
        }
    },
    'zh-CN': {
        a: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'a'].join('/'),
            data: {
                summary: '这是SVG <strong><code>a</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        altGlyphDef: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'altGlyphDef'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>altGlyphDef</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        clipPath: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'clipPath'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>clipPath</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        'color-profile': {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'color-profile'].join(
                '/'
            ),
            data: {
                summary:
                    '这是SVG <strong><code>color</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        cursor: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'cursor'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>cursor</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        filter: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'filter'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>filter</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        font: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'font'].join('/'),
            data: {
                summary: '这是SVG <strong><code>font</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        'font-face': {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'font-face'].join('/'),
            data: {
                summary: '这是SVG <strong><code>font</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        foreignObject: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'foreignObject'].join(
                '/'
            ),
            data: {
                summary:
                    '这是SVG <strong><code>foreignObject</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        image: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'image'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>image</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        marker: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'marker'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>marker</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        mask: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'mask'].join('/'),
            data: {
                summary: '这是SVG <strong><code>mask</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        pattern: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'pattern'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>pattern</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        script: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'script'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>script</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        style: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'style'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>style</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        switch: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'switch'].join('/'),
            data: {
                summary:
                    '这是SVG <strong><code>switch</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        text: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'text'].join('/'),
            data: {
                summary: '这是SVG <strong><code>text</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        },
        view: {
            url: ['/zh-CN', SVG_BASE_SLUG, 'Element', 'view'].join('/'),
            data: {
                summary: '这是SVG <strong><code>view</code></strong>元素的模拟',
                tags: ['SVG', 'Element']
            }
        }
    }
};

// Test cases definition
// ----------------------------------------------------------------------------
// Each test case is define by:
// A `title` to make the test understandable by a human behing
// An `input` which is an Array of parameters that will be passed to the macro
// An `output` which is the string that the macro should return,
// A `env` that is overriding the default env variable inside the macro
//
// NOTE: we could probably make that more generic by having a single test
//       runner (see below) and a bunch of JSON files (one per macro) to
//       describe all the possible inputs and their expected outputs.
// ----------------------------------------------------------------------------

const TEST_CASE = [
    {
        title: 'Test preview mode display (no param, no slug)',
        input: [],
        output:
            '<span style="color:red;">SVG info in preview not available</span>'
    },
    {
        title: 'Test unknown SVG element (param: foo)',
        input: ['foo'],
        output: '<span style="color:red;">missing</span>'
    },
    {
        // Defs allows to test multiple category and a mix of groups and elements for permitted contents
        title: 'Test explicit slug (param: defs)',
        input: ['defs'],
        output: makeExpect(SVG_DATA.elements.defs)
    },
    {
        // altGlyphDef allows to test when description is an object rather than a string
        title:
            'Test implicit slug (no param, slug: /en-US/docs/Web/SVG/Element/altGlyphDef)',
        input: [],
        output: makeExpect(SVG_DATA.elements.altGlyphDef),
        env: {
            slug: URL('en-US', SVG_BASE_SLUG, 'Element', 'altGlyphDef')
        }
    },
    {
        title:
            'Test implicit non English slug (no param, slug: /zh-CN/docs/Web/SVG/Element/defs)',
        input: [],
        output: makeExpect(SVG_DATA.elements.defs, 'zh-CN'),
        env: {
            locale: 'zh-CN',
            slug: URL('zh-CN', SVG_BASE_SLUG, 'Element', 'defs')
        }
    }
];

// Test runner
// ----------------------------------------------------------------------------

describeMacro('svginfo', () => {
    beforeEachMacro(macro => {
        macro.ctx.wiki.getPage = jest.fn(async url => {
            for (let locale of Object.keys(MOCK_PAGES)) {
                for (let page of Object.values(MOCK_PAGES[locale])) {
                    if (url === page.url) {
                        return page.data;
                    }
                }
            }
        });
    });

    TEST_CASE.forEach(test => {
        itMacro(test.title, macro => {
            if (test.env) {
                Object.keys(test.env).forEach(key => {
                    macro.ctx.env[key] = test.env[key];
                });
            }

            return assert.eventually.equal(
                macro.call(...test.input),
                test.output
            );
        });
    });
});
