/**
 * This file defines a render() function that takes as input a string
 * of text containing embedded KumaScript macros and asynchronously
 * returns a string in which the embedded macros have been
 * expanded. The render() function itself does not include any
 * asynchronous code, but macros may be asynchronous (they can make
 * HTTP requests, and use `await` for example), so the render() method
 * is declared `async`.
 *
 * Macros are embedded in source documents within pairs of curly
 * braces {{...}}. The Parser object of parser.js is used to extract
 * macro invocations (which can include arguments) and strings of
 * constant text from the source document.
 *
 * A Templates object (which represents a directory of EJS templates) is
 * used to render individual macros.
 *
 * When a macro is rendered, it takes a context object that defines
 * the values available to the macro. These values come from three
 * sources:
 *
 *   1) The macro API defined by the Environment class.
 *
 *   2) A context object passed to render(). This object defines
 *      values such as env.locale and env.title that are specific to
 *      the page being rendered.
 *
 *   3) An object that represents the arguments (if any) for a single
 *      macro invocation within a page. These are values that appear
 *      in the source document as part of the macro, and are bound to
 *      names $0, $1, etc.
 *
 * To render an HTML document that includes macro invocations, call
 * the render() function passing:
 *
 *   - the text of the page to be rendered
 *
 *   - a Templates object that represents the available macros
 *
 *   - the environment object that defines per-page values such as
 *     locale, title and slug.
 *
 * @prettier
 */
const Parser = require('./parser.js');
const Environment = require('./environment.js');
const {
    MacroInvocationError,
    MacroNotFoundError,
    MacroCompilationError,
    MacroExecutionError
} = require('./errors.js');

function normalize(name) {
    return name.replace(/:/g, '-').toLowerCase();
}

async function render(source, templates, pageEnvironment) {
    // Parse the source document.
    let tokens;
    try {
        tokens = Parser.parse(source);
    } catch (e) {
        // If there are any parsing errors in the input document
        // we can't process any of the macros, and just return the
        // source document unmodified, along with the error.
        // Note that rendering errors in the macros are different;
        // we handle these individually below.
        return [source, [new MacroInvocationError(e, source)]];
    }

    // If a mode (either 'render' or 'remove') and a list of macro names
    // was passed-in for the "selective_mode" environment variable, then
    // we only process (according to the mode) those selected macros,
    // ignoring all others.
    let selectMacros;
    let selectiveMode = false;
    if (pageEnvironment.selective_mode) {
        [selectiveMode, selectMacros] = pageEnvironment.selective_mode;
        // Normalize the macro names for the purpose of robust comparison.
        selectMacros = selectMacros.map(name => normalize(name));
    }

    // Create the Environment object that we'll use to render all of
    // the macros on the page
    let environment = new Environment(pageEnvironment, templates);

    // Loop through the tokens, rendering the macros and collecting
    // the resulting promises. We detect duplicate invocations and
    // only render those once, on the assumption that their output will
    // be the same each time. (This is an important optimization for
    // xref macros, for example, since they can make asynchronous
    // network requests, and documents often have duplicate xrefs.)
    let promises = [];
    let signatureToPromiseIndex = new Map();

    // Keep track of errors that occur when rendering the macros.
    let errors = [];

    // If we're only removing selected macros, we don't need to render anything.
    if (selectiveMode !== 'remove') {
        // Loop through the tokens
        for (let token of tokens) {
            // We only care about macros; skip anything else
            if (token.type !== 'MACRO') {
                continue;
            }

            let macroName = normalize(token.name);

            // If we're only rendering selected macros, ignore the rest.
            if (
                selectiveMode === 'render' &&
                !selectMacros.includes(macroName)
            ) {
                continue;
            }

            // Check to see if we're already processing this exact
            // macro invocation. To do that we need a signature for
            // the macro. When the macro has json arguments we want to
            // ignore their order, so we do some tricky stringification
            // here in that case.
            if (token.args.length === 1 && typeof token.args[0] === 'object') {
                // the json args case
                let keys = Object.keys(token.args[0]);
                keys.sort();
                token.signature =
                    macroName + JSON.stringify(token.args[0], keys);
            } else {
                // the regular case: args is just an array of strings
                token.signature = macroName + JSON.stringify(token.args);
            }

            // If this signature is already in the signature map, then we're
            // already running the macro and don't need to do anything here.
            if (signatureToPromiseIndex.has(token.signature)) {
                continue;
            }

            // Now start rendering this macro. Most macros are
            // synchronous and very fast, but some may make network
            // requests, so we treat them all as async and build up an
            // array of promises.  Note that we will await on the
            // entire array, not on each promise individually. That
            // allows the macros to execute in parallel. We map this
            // macro's signature to the index of its promise in the
            // array so that later we can find the output for each
            // macro.
            let index = promises.length;
            signatureToPromiseIndex.set(token.signature, index);
            errors.push(null);
            promises.push(
                templates
                    .render(
                        macroName,
                        environment.getExecutionContext(token.args)
                    )
                    .catch(e => {
                        // If there was an error rendering this macro, we still
                        // want the promise to resolve normally, otherwise the
                        // Promise.all() will fail. So we resolve to "", and
                        // store the error in the errors array.
                        if (
                            e instanceof ReferenceError &&
                            e.message.startsWith('Unknown macro')
                        ) {
                            // The named macro does not exist
                            errors[index] = new MacroNotFoundError(
                                e,
                                source,
                                token
                            );
                        } else if (e.name === 'SyntaxError') {
                            // There was a syntax error compiling the macro
                            errors[index] = new MacroCompilationError(
                                e,
                                source,
                                token
                            );
                        } else {
                            // There was a runtime error executing the macro
                            errors[index] = new MacroExecutionError(
                                e,
                                source,
                                token
                            );
                        }
                        return '';
                    })
            );
        }
    }

    // Now wait for all the promises to finish
    let results = await Promise.all(promises);

    // And assemble the output document
    let output = tokens
        .map(token => {
            if (token.type === 'MACRO') {
                if (selectiveMode) {
                    if (selectMacros.includes(normalize(token.name))) {
                        if (selectiveMode === 'remove') {
                            return '';
                        }
                    } else {
                        // For un-selected macros, just use the original macro
                        // source text for the output.
                        return source.slice(
                            token.location.start.offset,
                            token.location.end.offset
                        );
                    }
                }
                // We've reached this point if either we're rendering all macros
                // or we're rendering selected macros and this is a macro we've
                // selected.
                let promiseIndex = signatureToPromiseIndex.get(token.signature);
                if (errors[promiseIndex]) {
                    // If there was an error rendering this macro, then we
                    // just use the original macro source text for the output.
                    return source.slice(
                        token.location.start.offset,
                        token.location.end.offset
                    );
                }
                return results[promiseIndex];
            } else {
                // If it isn't a MACRO token, it is a TEXT token
                return token.chars;
            }
        })
        .join('');

    // The return value is the rendered string plus an array of errors.
    return [output, errors.filter(e => e !== null)];
}

module.exports = render;
