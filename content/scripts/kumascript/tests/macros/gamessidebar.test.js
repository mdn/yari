/**
 * @prettier
 */

const { assert, itMacro, describeMacro } = require('./utils');
const jsdom = require('jsdom');

const locales = {
    'en-US': {
        Introduction: 'Introduction'
    },
    ja: {
        Introduction: 'Web のゲーム開発紹介'
    }
};

function checkSidebarDom(dom, locale) {
    let section = dom.querySelector('section');
    assert(
        section.classList.contains('Quick_links'),
        'Section does not contain Quick_links class'
    );

    let summaries = dom.querySelectorAll('summary');
    assert.equal(summaries[0].textContent, locales[locale].Introduction);
}

describeMacro('GamesSidebar', function() {
    itMacro('Creates a sidebar object for en-US', function(macro) {
        macro.ctx.env.locale = 'en-US';
        return macro.call().then(function(result) {
            let dom = jsdom.JSDOM.fragment(result);
            checkSidebarDom(dom, 'en-US');
        });
    });

    itMacro('Creates a sidebar object for ja', function(macro) {
        macro.ctx.env.locale = 'ja';
        return macro.call().then(function(result) {
            let dom = jsdom.JSDOM.fragment(result);
            checkSidebarDom(dom, 'ja');
        });
    });
});
