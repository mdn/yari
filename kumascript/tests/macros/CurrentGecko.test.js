/**
 * @prettier
 */
const { assert, itMacro, describeMacro, beforeEachMacro } = require('./utils');

describeMacro('CurrentGecko', function() {
    beforeEachMacro(function(macro) {
        // Create a test fixture to mock the mdn.fetchJSONResource function.
        macro.ctx.mdn.fetchJSONResource = jest.fn(url => ({
            FIREFOX_NIGHTLY: '65.0a1',
            FIREFOX_AURORA: '',
            FIREFOX_ESR: '52.8.1esr',
            FIREFOX_ESR_NEXT: '60.0.2esr',
            LATEST_FIREFOX_DEVEL_VERSION: '61.0b14',
            FIREFOX_DEVEDITION: '64.0b2',
            LATEST_FIREFOX_OLDER_VERSION: '3.6.28',
            LATEST_FIREFOX_RELEASED_DEVEL_VERSION: '63.0b14',
            LATEST_FIREFOX_VERSION: '62.0.2'
        }));
    });
    itMacro('No arguments (release)', async function(macro) {
        expect(await macro.call()).toEqual('62.0.2');
    });
    itMacro('Release', function(macro) {
        return assert.eventually.equal(macro.call('Release'), '62.0.2');
    });
    itMacro('Beta', function(macro) {
        return assert.eventually.equal(macro.call('beta'), '61');
    });
    itMacro('Nightly', function(macro) {
        return assert.eventually.equal(macro.call('nighTLY'), '65');
    });
    itMacro('Central', function(macro) {
        return assert.eventually.equal(macro.call('CENtral'), '65');
    });
    itMacro('Aurora', function(macro) {
        return assert.eventually.equal(macro.call('aurora'), '61');
    });
    itMacro('ESR', function(macro) {
        return assert.eventually.equal(macro.call('ESR'), '52.8.1');
    });
    itMacro('nonsense', function(macro) {
        return assert.eventually.equal(macro.call('nonsense'), 'undefined');
    });
});
