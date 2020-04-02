/**
 * @prettier
 */

const { assert, itMacro, describeMacro } = require('./utils');

describeMacro('spec2', function() {
    itMacro('CR (en-US)', function(macro) {
        return assert.eventually.equal(
            macro.call('Upgrade Insecure Requests'),
            '<span class="spec-CR">Candidate Recommendation</span>'
        );
    });
    itMacro('ED (en-US)', function(macro) {
        return assert.eventually.equal(
            macro.call('FileSystem'),
            '<span class="spec-ED">Editor&#39;s Draft</span>'
        );
    });
    itMacro('WD (ja)', function(macro) {
        macro.ctx.env.locale = 'ja';
        return assert.eventually.equal(
            macro.call('CSS3 Box'),
            '<span class="spec-WD">草案</span>'
        );
    });
    itMacro('REC (de)', function(macro) {
        macro.ctx.env.locale = 'de';
        return assert.eventually.equal(
            macro.call('User Timing'),
            '<span class="spec-REC">Empfehlung</span>'
        );
    });
    itMacro('Draft (ru)', function(macro) {
        macro.ctx.env.locale = 'ru';
        return assert.eventually.equal(
            macro.call('Async Function'),
            '<span class="spec-Draft">Черновик</span>'
        );
    });
    itMacro('Living (fr)', function(macro) {
        macro.ctx.env.locale = 'fr';
        return assert.eventually.equal(
            macro.call('Background Sync'),
            '<span class="spec-Living">Standard évolutif</span>'
        );
    });
    itMacro('Standard (pt-BR)', function(macro) {
        macro.ctx.env.locale = 'pt-BR';
        return assert.eventually.equal(
            macro.call('ES1'),
            '<span class="spec-Standard">Padrão</span>'
        );
    });
    itMacro('Obsolete (en-US)', function(macro) {
        return assert.eventually.equal(
            macro.call('Typed Array'),
            '<span class="spec-Obsolete">Obsolete</span>'
        );
    });
    itMacro('Old-Transforms (en-US)', function(macro) {
        return assert.eventually.equal(
            macro.call('CSS3 2D Transforms'),
            '<span class="spec-WD">Working Draft</span>'
        );
    });
    itMacro('Unknown (en-US)', function(macro) {
        return assert.eventually.equal(
            macro.call('fleetwood mac'),
            '<span class="spec-">Unknown</span>'
        );
    });
    // Test that locale affects "unknown".
    itMacro('Unknown (ja)', function(macro) {
        macro.ctx.env.locale = 'ja';
        return assert.eventually.equal(
            macro.call('fleetwood mac'),
            '<span class="spec-">不明</span>'
        );
    });
});
