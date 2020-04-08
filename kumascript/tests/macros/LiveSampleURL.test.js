/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require('./utils');

describeMacro('LiveSampleURL', function() {
    itMacro('Production settings', function(macro) {
        macro.ctx.env.live_samples = {
            base_url: 'https://mdn.mozillademos.org'
        };
        macro.ctx.env.url =
            'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p';
        macro.ctx.env.revision_id = 1393227;
        return assert.eventually.equal(
            macro.call('Example'),
            'https://mdn.mozillademos.org/en-US/docs/Web/HTML/Element/p$samples/Example?revision=1393227'
        );
    });
    itMacro('Override page URL', function(macro) {
        macro.ctx.env.live_samples = {
            base_url: 'https://mdn.mozillademos.org'
        };
        macro.ctx.env.url =
            'https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/How_to_build_custom_form_widgets';
        macro.ctx.env.revision_id = 1351912;
        return assert.eventually.equal(
            macro.call(
                'No_JS',
                'https://developer.mozilla.org/en-US/docs/HTML/Forms/How_to_build_custom_form_widgets/Example_2'
            ),
            'https://mdn.mozillademos.org/en-US/docs/HTML/Forms/How_to_build_custom_form_widgets/Example_2$samples/No_JS?revision=1351912'
        );
    });
    itMacro('Staging settings', function(macro) {
        macro.ctx.env.live_samples = {
            base_url: 'https://files-stage.mdn.mozit.cloud'
        };
        macro.ctx.env.url =
            'https://developer.allizom.org/en-US/docs/Web/CSS/background-color';
        macro.ctx.env.revision_id = 1291055;
        return assert.eventually.equal(
            macro.call('Examples'),
            'https://files-stage.mdn.mozit.cloud/en-US/docs/Web/CSS/background-color$samples/Examples?revision=1291055'
        );
    });
    itMacro('Development default settings', function(macro) {
        macro.ctx.env.live_samples = { base_url: 'http://localhost:8000' };
        macro.ctx.env.url =
            'http://localhost:8000/en-US/docs/Web/HTML/Element/p';
        macro.ctx.env.revision_id = 123;
        return assert.eventually.equal(
            macro.call('Example'),
            'http://localhost:8000/en-US/docs/Web/HTML/Element/p$samples/Example?revision=123'
        );
    });
    itMacro('Unicode ID', function(macro) {
        macro.ctx.env.live_samples = {
            base_url: 'https://mdn.mozillademos.org'
        };
        macro.ctx.env.url =
            'https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-direction';
        macro.ctx.env.revision_id = 1366760;
        return assert.eventually.equal(
            macro.call('例子'),
            'https://mdn.mozillademos.org/zh-CN/docs/Web/CSS/flex-direction$samples/%E4%BE%8B%E5%AD%90?revision=1366760'
        );
    });
    itMacro('Development demo settings', function(macro) {
        macro.ctx.env.live_samples = { base_url: 'http://demos:8000' };
        macro.ctx.env.url =
            'http://localhost:8000/en-US/docs/Web/HTML/Element/p';
        macro.ctx.env.revision_id = 123;
        return assert.eventually.equal(
            macro.call('Example'),
            'http://demos:8000/en-US/docs/Web/HTML/Element/p$samples/Example?revision=123'
        );
    });
});
