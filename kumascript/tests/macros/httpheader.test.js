/**
 * @prettier
 */

const { assert, itMacro, describeMacro } = require('./utils');

describeMacro('httpheader', function() {
    itMacro('No arguments (en-US)', function(macro) {
        macro.ctx.wiki.getPage = jest.fn(url => undefined);
        return assert.eventually.equal(
            macro.call(),
            `<a href="/en-US/docs/Web/HTTP/Headers/" title="The documentation about this has not yet been written; please consider contributing!"><code></code></a>`
        );
    });
    itMacro('One argument (en-US)', function(macro) {
        macro.ctx.wiki.getPage = jest.fn(url => ({
            summary:
                'The <strong><code>Accept</code></strong> request HTTP header...'
        }));
        return assert.eventually.equal(
            macro.call('Accept'),
            `<a href="/en-US/docs/Web/HTTP/Headers/Accept" title="The Accept request HTTP header..."><code>Accept</code></a>`
        );
    });
    itMacro('One argument (ko)', function(macro) {
        macro.ctx.env.locale = 'ko';
        macro.ctx.wiki.getPage = jest.fn(url => ({
            summary:
                '<strong><code>Date</code></strong> 일반 HTTP 헤더는 메시지가 만들어진 날짜와 시간을 포함합니다.'
        }));
        return assert.eventually.equal(
            macro.call('Date'),
            `<a href="/ko/docs/Web/HTTP/Headers/Date" title="Date 일반 HTTP 헤더는 메시지가 만들어진 날짜와 시간을 포함합니다."><code>Date</code></a>`
        );
    });
    itMacro('One unknown argument (en-US)', function(macro) {
        return assert.eventually.equal(
            macro.call('fleetwood-mac'),
            `<a href="/en-US/docs/Web/HTTP/Headers/fleetwood-mac" title="The documentation about this has not yet been written; please consider contributing!"><code>fleetwood-mac</code></a>`
        );
    });
    itMacro('Two arguments (en-US)', function(macro) {
        macro.ctx.wiki.getPage = jest.fn(url => ({
            summary:
                'The <strong><code>Accept-Language</code></strong> request HTTP header...'
        }));
        return assert.eventually.equal(
            macro.call('Accept-Language', 'Accept-*'),
            `<a href="/en-US/docs/Web/HTTP/Headers/Accept-Language" title="The Accept-Language request HTTP header..."><code>Accept-*</code></a>`
        );
    });
    itMacro('Three arguments (en-US)', function(macro) {
        macro.ctx.wiki.getPage = jest.fn(url => ({
            summary:
                'The <strong><code>Accept-Language</code></strong> request HTTP header...'
        }));
        return assert.eventually.equal(
            macro.call('Accept-Language', 'Accept-*', 'YYY'),
            `<a href="/en-US/docs/Web/HTTP/Headers/Accept-Language#YYY" title=""><code>Accept-*.YYY</code></a>`
        );
    });
    itMacro('Four arguments (code) (en-US)', function(macro) {
        macro.ctx.wiki.getPage = jest.fn(url => ({
            summary:
                'The <strong><code>Accept-Language</code></strong> request HTTP header...'
        }));
        return assert.eventually.equal(
            macro.call('Accept-Language', 'Accept-*', 'YYY', false),
            `<a href="/en-US/docs/Web/HTTP/Headers/Accept-Language#YYY" title=""><code>Accept-*.YYY</code></a>`
        );
    });
    itMacro('Four arguments (not code) (en-US)', function(macro) {
        macro.ctx.wiki.getPage = jest.fn(url => ({
            summary:
                'The <strong><code>Accept-Language</code></strong> request HTTP header...'
        }));
        return assert.eventually.equal(
            macro.call('Accept-Language', 'Accept-*', 'YYY', true),
            `<a href="/en-US/docs/Web/HTTP/Headers/Accept-Language#YYY" title="">Accept-*.YYY</a>`
        );
    });
});
