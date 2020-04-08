/**
 * @prettier
 */

const { itMacro, describeMacro } = require('./utils');

/**
 * Different strings in GroupData objects have different sets of
 * permitted characters.
 */
const permittedCharacters = {
    group: /^[\w ()-]+$/,
    overview: /^[\w ()-]+$/,
    interface: /^[A-Z][\w.]+$/,
    property: /^[\w.]+$/,
    method: /^[\w.()]+$/,
    event: /^[\w]+: [\w]+$/,
    dictionary: /^\w+$/,
    callback: /^\w+$/,
    type: /^\w+$/,
    guideUrl: /^\/[\w-.~/]+$/
};

/**
 * Properties that are allowed in a group
 */
const permittedGroupProperties = [
    'overview',
    'interfaces',
    'methods',
    'properties',
    'dictionaries',
    'callbacks',
    'types',
    'events',
    'guides'
];

/**
 * Properties that must be present in a group
 */
const mandatoryGroupProperties = [
    'interfaces',
    'methods',
    'properties',
    'events'
];

/**
 * Check that `obj` contains:
 * - only the properties in `permitted`
 * - all the properties in `mandatory`
 *
 * @param {object} obj
 * @param {string[]} permitted
 * @param {string[]} mandatory
 */
function checkProperties(obj, permitted, mandatory) {
    let props = Object.keys(obj);
    for (let prop of props) {
        expect(permitted).toContain(prop);
    }
    for (let prop of mandatory) {
        expect(props).toContain(prop);
    }
}

/**
 * Check that `strings` is an array of strings,
 * and that each string matches the given regex.
 *
 * @param {string[]} strings
 * @param {RegExp} permitted
 */
function checkStringArray(strings, permitted) {
    expect(Array.isArray(strings)).toBe(true);
    for (let string of strings) {
        expect(string).toMatch(permitted);
    }
}

/**
 * Performs basic validation of the GroupData JSON object
 *
 * @param {string} groupDataJson
 */
function checkGroupData(groupDataJson) {
    const groupData = JSON.parse(groupDataJson);

    // GroupData is an array containing exactly one object
    expect(Array.isArray(groupData)).toBe(true);
    expect(groupData.length).toBe(1);

    // the one object has one property for each group
    // the property's key is the group name
    const groupNames = Object.keys(groupData[0]);

    for (let groupName of groupNames) {
        // the group name contains only the permitted characters
        expect(groupName).toMatch(permittedCharacters.group);

        const group = groupData[0][groupName];

        // the group has the correct properties
        checkProperties(
            group,
            permittedGroupProperties,
            mandatoryGroupProperties
        );

        // string arrays contain only their permitted characters
        checkStringArray(group.interfaces, permittedCharacters.interface);
        checkStringArray(group.properties, permittedCharacters.property);
        checkStringArray(group.methods, permittedCharacters.method);
        checkStringArray(group.events, permittedCharacters.event);

        // dictionaries, callbacks, and types are optional
        if (group.dictionaries) {
            checkStringArray(
                group.dictionaries,
                permittedCharacters.dictionary
            );
        }
        if (group.callbacks) {
            checkStringArray(group.callbacks, permittedCharacters.callback);
        }
        if (group.types) {
            checkStringArray(group.types, permittedCharacters.type);
        }

        // overview is optional
        if (group.overview) {
            // if present it is an array containing 1 element
            expect(Array.isArray(group.overview)).toBe(true);
            expect(group.overview.length).toBe(1);
            // ... and the element must contain only the permitted characters
            expect(group.overview[0]).toMatch(permittedCharacters.overview);
        }

        if (group.guides) {
            checkStringArray(group.guides, permittedCharacters.guideUrl);
        }
    }
}

describeMacro('GroupData', function() {
    itMacro('Validate GroupData JSON', function(macro) {
        return macro.call().then(checkGroupData);
    });
});
