/**
 * @prettier
 */

const { assert, itMacro, describeMacro } = require('./utils');

const specStatusValues = [
    'REC',
    'PR',
    'CR',
    'RC',
    'WD',
    'ED',
    'Old-Transforms',
    'Living',
    'RFC',
    'Standard',
    'Draft',
    'Obsolete',
    'LC'
];

/*
Performs basic validation of the SpecData JSON object:
 * All entries must have name, url, and status properties.
 * The url property must be an HTTPS URL.
 * The status property must be in the list of valid status values.
 */
function checkSpecData(specDataJson) {
    const entries = Object.entries(JSON.parse(specDataJson));

    for (let entry of entries) {
        assert(
            entry[1].name !== undefined,
            `SpecData entry: ${entry[0]} is missing required "name" property`
        );
        assert(
            entry[1].url !== undefined,
            `SpecData entry: ${entry[0]} is missing required "url" property`
        );
        assert(
            entry[1].status !== undefined,
            `SpecData entry: ${entry[0]} is missing required "status" property`
        );

        assert(
            entry[1].url.startsWith('https://'),
            `SpecData entry: ${entry[0]}: "url" is not an HTTPS URL`
        );
        assert(
            specStatusValues.includes(entry[1].status),
            `SpecData: ${entry[0]}: "status" is not a valid value`
        );
    }
}

describeMacro('SpecData', function() {
    itMacro('Validate SpecData JSON', function(macro) {
        return macro.call().then(checkSpecData);
    });
});
