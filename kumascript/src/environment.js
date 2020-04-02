/**
 * An Environment object defines the API available to KumaScript macros
 * through the MDN, wiki, page and other global objects. When you create
 * an Environment object, pass an object that defines the per-page
 * macro execution context. This defines values like env.locale and
 * env.title that macros can use.
 *
 * To render a single macro, call the getExecutionContext() method, passing
 * in the list of arguments to be exposed to the macro. This returns an
 * object that you can pass to the render() method of your Templates object.
 *
 * The functions defined on the various *Prototype objects in this file
 * will be bound to the global kumascript macro execution environment and
 * can use `this.mdn`, `this.wiki`, `this.env`, etc to refer to the parts
 * of that execution environment. Because the functions will all be bound
 * (see the prepareProto() function at the end of this file) they can not
 * use `this` to refer to the objects in which they are actually defined.
 *
 * TODO(djf): The *Prototype objects could each be defined in a
 * separate src/api/*.js file and imported with require(). That would
 * be tidier, and would keep separate the code with poor test coverage
 * from the rest of the file which is well tested.
 *
 * @prettier
 */

// The properties of this object will be globals in the macro
// execution environment.
const globalsPrototype = {
    /**
     * #### require(name)
     *
     * Load an npm package (the real "require" has its own cache).
     *
     * @type {NodeRequireFunction}
     */
    require: require
};

const kumaPrototype = require('./api/kuma.js');
const mdnPrototype = require('./api/mdn.js');
const stringPrototype = require('./api/string.js');
const wikiPrototype = require('./api/wiki.js');
const uriPrototype = require('./api/uri.js');
const webPrototype = require('./api/web.js');
const pagePrototype = require('./api/page.js');

class Environment {
    // Intialize an environment object that will be used to render
    // all of the macros in one document or page. We pass in a context
    // object (which may come from HTTP request headers) that gives
    // details like the page title and URL. These are available to macros
    // through the global 'env' object, and some of the properties
    // are also copied onto the global 'page' object.
    //
    // Note that we don't use the Environment object directly when
    // executing macros. Instead call getExecutionContext(), supplying
    // the macro arguments list to get an object specific for executing
    // one macro.
    //
    // Note that we pass the Templates object when we create an Environment.
    // this is so that macros can recursively execute other named macros
    // in the same environment.
    //
    // The optional third argument is for use only by tests. Setting it to
    // true makes us not freeze the environment so that tests can stub out
    // methods in the API like mdn.fetchJSONResources
    //
    constructor(perPageContext, templates, testing = false) {
        // Freeze an object unless we're in testing mode
        function freeze(o) {
            return testing ? o : Object.freeze(o);
        }

        /**
         * For each function-valued property in o, bind that function
         * to the specified bindings object, if there is one. Also,
         * create lowercase and titlecase variants of each property in
         * o, and finally, freeze the object o and return it.
         *
         * The binding means that the functions defined in this file can
         * use `this` to refer to the global kumascript environment and
         * can use `this.env.locale` and `this.MDN.fetchJSONResource()`
         * for example.
         *
         * The case-insensitive variants implement legacy behavior in
         * KumaScript, where macros can use case-insensitive names of
         * objects and methods.
         *
         * And the freeze() call is a safety measure to prevent
         * macros from modifying the execution environment.
         */
        function prepareProto(o, binding) {
            let p = {};
            for (let [key, value] of Object.entries(o)) {
                if (binding && typeof value === 'function') {
                    value = value.bind(binding);
                }
                p[key] = value;
                p[key.toLowerCase()] = value;
                p[key[0].toUpperCase() + key.slice(1)] = value;
            }
            return freeze(p);
        }

        this.templates = templates;
        let globals = Object.create(prepareProto(globalsPrototype));

        let kuma = Object.create(prepareProto(kumaPrototype, globals));
        let mdn = Object.create(prepareProto(mdnPrototype, globals));
        let string = Object.create(prepareProto(stringPrototype, globals));
        let wiki = Object.create(prepareProto(wikiPrototype, globals));
        let uri = Object.create(prepareProto(uriPrototype, globals));
        let web = Object.create(prepareProto(webPrototype, globals));
        let page = Object.create(prepareProto(pagePrototype, globals));
        let env = Object.create(prepareProto(perPageContext));

        // The page object also gets some properties copied from
        // the per-page context object
        page.language = perPageContext.locale;
        page.tags = Array.isArray(perPageContext.tags)
            ? [...perPageContext.tags] // defensive copy
            : perPageContext.tags;
        page.title = perPageContext.title;
        page.uri = perPageContext.url;

        // Now update the globals object to define each of the sub-objects
        // and the environment object as global variables
        globals.kuma = globals.Kuma = freeze(kuma);
        globals.MDN = globals.mdn = freeze(mdn);
        globals.string = globals.String = freeze(string);
        globals.wiki = globals.Wiki = freeze(wiki);
        globals.uri = globals.Uri = freeze(uri);
        globals.web = globals.Web = freeze(web);
        globals.page = globals.Page = freeze(page);
        globals.env = globals.Env = freeze(env);

        // Macros use the global template() method to excute other
        // macros. This is the one function that we can't just
        // implement on globalsPrototype because it needs acccess to
        // this.templates.
        globals.template = this._renderTemplate.bind(this);

        this.prototypeEnvironment = freeze(globals);
    }

    // A templating function that we define in the global environment
    // so that templates can invoke other templates. This is not part
    // of the public API of the class; it is for use by other templates
    async _renderTemplate(name, args) {
        return await this.templates.render(
            name,
            this.getExecutionContext(args)
        );
    }

    // Get a customized environment object that is specific to a single
    // macro on a page by including the arguments to be passed to that macro.
    getExecutionContext(args) {
        let context = Object.create(this.prototypeEnvironment);

        // Make a defensive copy of the arguments so that macros can't
        // modify the originals. Use an empty array if no args provided.
        args = args ? [...args] : [];

        // The arguments are either all strings, or there is a single
        // JSON-compatible object. If it is an object, we need to protect it
        // against modifications.
        if (typeof args[0] === 'object') {
            args[0] = JSON.parse(JSON.stringify(args[0]));
        }

        // The array of arguments will be available to macros as the
        // globals "arguments" and "$$". Individual arguments will be $0,
        // $1 and so on.
        context['arguments'] = context['$$'] = args;
        for (let i = 0; i < args.length; i++) {
            context['$' + i] = args[i];
        }

        // Set any unused arguments up to $9 to the empty string
        // NOTE: old KumaScript went up to $99, but we don't have any
        // macros that use two digit argument numbers
        for (let i = args.length; i < 10; i++) {
            context['$' + i] = '';
        }

        return context;
    }
}

module.exports = Environment;
