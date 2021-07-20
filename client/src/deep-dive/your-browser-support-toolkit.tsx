import { useParams } from "react-router-dom";

import ArticleMeta from "../ui/molecules/article-meta";
import Byline from "../ui/organisms/byline";
import DeepDivesFeature from "../ui/organisms/deep-dives-feature";

import "./index.scss";

export default function YourBrowserSupportToolkit() {
  const { locale } = useParams();

  return (
    <>
      <div className="girdle">
        <article className="deep-dive-article-container">
          <header className="main-heading-group heading-group">
            <h1>Your browser support toolkit</h1>
            <h2>Modern CSS in the real world : Part two</h2>
          </header>
          <p className="article-lead">
            Viverra neque eget tellus, gravida pellentesque non. Purus,
            venenatis sit ac nam nec. At vitae facilisi in mi amet aliquam.
          </p>
          <Byline
            avatar="rachel-andrew.png"
            author="Rachel Andrew"
            authorDescription="MDN Editor &amp; Writer, Former Editor in Chief of Smashing Magazine"
          />
          <ArticleMeta
            publishDate="March 29th, 2021"
            readTime="18 minute read"
          />
          <p>
            <img
              className="feature-image"
              src="/assets/article-images/your-browser-support-toolkit.svg"
              width="782"
              height="440"
              alt="illustration of various tech devices and browser windows"
            />
          </p>
          <p>
            Once you have a strategy and target browsers to support, you can get
            set up to develop in a robust way, considering how your site will
            look in modern browsers, and how that look will differ in older
            browsers. In this article you can find out the tools that are
            available to help with this.
          </p>
          <h3>Resources for browser support information</h3>
          <p>
            Being able to understand how well a feature is supported by browsers
            can help you decide which methods to use when building your site.
          </p>
          <p>
            For broad support information, for example “does this browser
            support CSS Grid?”, the Can I Use website is helpful.
          </p>
          <figure>
            <img
              src="/assets/article-images/ybst001.png"
              width="783"
              height="426"
              alt=""
            />
            <figcaption>
              The support page for{" "}
              <a href="https://caniuse.com/?search=css%20grid">
                css grid on Can I Use
              </a>
              .
            </figcaption>
          </figure>
          <p>
            For more granular information, the MDN CSS property reference pages
            provide detailed browser support tables for each property and their
            values. This can be very helpful, as additions to CSS are not always
            brand new properties &mdash; sometimes an additional value is added
            for an existing property. Take a look at the Browser Compatibility
            Data (BCD) chart for the grid-template-columns property as an
            example.
          </p>
          <figure>
            <img
              src="/assets/article-images/bcd001.png"
              width="783"
              height="459"
              alt=""
            />
            <figcaption>
              Browser Compat Data (BCD) table on MDN for{" "}
              <a href="https://developer.mozilla.org/docs/Web/CSS/grid-template-columns#browser_compatibility">
                grid-template-columns
              </a>
              .
            </figcaption>
          </figure>
          <p>
            The first line tells you the browser versions that the property was
            first supported in. Subsequent lines detail various values for
            grid-template-columns, in addition to features such as animation,
            which has variable support. As indicated by the little
            downward-pointing arrows, there is often additional information
            included as notes. That might include links to bugs raised against a
            browser for the feature, or some specific details of a compat issue.
          </p>
          <p>
            At the time of writing, if my support policy required support for
            the last two versions of evergreen browsers, this table would allow
            me to rule out using subgrid as a main layout feature due to lack of
            support in Chrome-based browsers.
          </p>
          <p>
            When writing CSS, if something isn’t working as you expect, then a
            quick look at that property on MDN can quickly tell you if the
            problem is lack of support rather than anything you are doing wrong!
          </p>
          <h4>Looking up browser bugs</h4>
          <p>
            MDN lists some major known bugs as part of BCD, however if you think
            you are seeing buggy behavior not listed on MDN then there are some
            other places to check.
          </p>
          <p>There are a few community-curated lists of bugs, for example:</p>
          <ul>
            <li>
              <a href="https://github.com/philipwalton/flexbugs">
                Flexbugs: listing flexbox issues and workarounds{" "}
              </a>
            </li>
            <li>
              <a href="https://github.com/rachelandrew/gridbugs">
                Gridbugs: listing CSS Grid Layout issues and workarounds
              </a>
            </li>
          </ul>
          <p>
            These are particularly useful as they often detail how you can avoid
            triggering the problem, by making a small change to your code.
          </p>
          <p>
            As you saw when looking at the BCD for grid-template-columns, web
            browsers also maintain lists of bugs that have been reported. In a
            browser bug tracker, a “bug” might be the need for a feature to be
            implemented, in addition to actual bugs where the feature is
            implemented but needs fixing as it works in a different way to that
            described by the specification, or implementations in other
            browsers.
          </p>
          <ul>
            <li>
              <a href="https://bugzilla.mozilla.org/">Firefox bugs</a>
            </li>
            <li>
              <a href="https://bugs.chromium.org/p/chromium/issues/list">
                Chromium bugs
              </a>
            </li>
            <li>
              <a href="https://bugs.webkit.org/">WebKit bugs</a>
            </li>
          </ul>
          <p>
            When searching, don’t forget to search for other properties that are
            involved in causing the bug. For example, you might be seeing a
            “flexbox bug”, however the actual problem might be with the
            align-content property. In the next article we will work through how
            to go about identifying exactly what is causing the problem, to help
            make this easier.
          </p>
          <h4>Learning about features that are coming soon</h4>
          <p>
            A large website project might take several months to complete, in
            which time a large number of CSS features could have become
            available in your target browsers. It’s worth keeping an eye on
            features that are in beta versions of browsers, as they may be
            something you can use by the time you launch.
          </p>
          <p>
            The bug trackers mentioned previously can often give you notice that
            a feature is being included in a browser; if the bug is marked
            closed it doesn’t necessarily mean that it has shipped in the
            release version, but it may be in the beta already. Other places to
            look include the following resources:
          </p>
          <ul>
            <li>
              <a href="https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features">
                Firefox Experimental features
              </a>
            </li>
            <li>
              <a href="https://chromestatus.com/features">
                Chrome Platform Status
              </a>
            </li>
            <li>
              <a href="https://developer.apple.com/safari/technology-preview/release-notes/">
                Safari Technology Preview release notes
              </a>
            </li>
          </ul>
          <p>
            If you are taking a progressively enhanced approach, then you might
            be able to use an enhancement that doesn’t quite make the cut in
            terms of your browser support strategy at the time of coding, but is
            likely to by launch.
          </p>
          <h3>Web platform features and fallbacks</h3>
          <p>
            If you have discovered that a feature isn’t supported in a browser,
            but still intend to use it, you might need to create a fallback for
            browsers that don't support it. In addition, if you are allowing
            browsers without support to fall back to a basic layout, you need to
            make sure that the code aimed at modern browsers doesn’t leak
            through to older browsers and make a mess.
          </p>
          <p>
            In recent years creating CSS fallbacks has become much easier and
            CSS has native features that can help you. Two of the most powerful
            are the cascade and feature queries, and we'll explore these now.
            Later on we'll also look at how vendor prefixes can be a useful tool
            as long as they are used carefully.
          </p>
          <h4>Using the cascade</h4>
          <p>
            The first thing to look at is how the cascade works with properties
            and values that are not understood by a browser. We can create
            simple fallbacks by writing CSS for old browsers, then following it
            with CSS aimed at newer browsers. For example, you might want to
            provide a simple solid background color for really old browsers, and
            a semi-transparent color for newer browsers:
          </p>
          <div className="code-snippet">
            <code>
              <span className="code-c">background-color</span>: red;
              <br />
              <span className="code-c">background-color</span>: rgba(
              <span className="code-m">255</span>,
              <span className="code-m">0</span>,
              <span className="code-m">0</span>,
              <span className="code-m">0.6</span>);
            </code>
          </div>
          <p>
            The idea is that older browsers support the first declaration and so
            will apply it to the page, then treat the second one as invalid
            because they don't support it &mdash; this means they completely
            ignore it. Newer browsers will support both declarations, however
            the rules of the cascade mean that the declaration that comes later
            in the stylesheet will override the earlier one, and be used by the
            browser.
          </p>
          <p>
            CSS also has rules defining what happens when there are two
            potentially conflicting things being applied to an element. For
            example, if you have a floated item and its parent becomes a grid
            container, the floated item stops behaving like a floated item and
            becomes a grid item. We can see how this works in the following
            demo.
          </p>
          <p>
            In this example, the component has a simple, floated layout. This is
            the layout that browsers without CSS Grid support will use. For
            newer browsers the container has been turned into a grid container,
            which means that in a browser with CSS grid support the float is not
            applied.
          </p>
          <div className="code-snippet">
            <div className="codepen">
              <iframe
                id="cp_embed_MWJVaqm"
                src="https://codepen.io/rachelandrew/embed/qBrZVVm?height=450&amp;theme-id=1&amp;slug-hash=qBrZVVm&amp;default-tab=css,result"
                scrolling="no"
                allowFullScreen={false}
                title="Modern CSS 2:2"
                className="codepen"
                loading="lazy"
                style={{
                  width: "100%",
                  overflow: "hidden",
                  height: "100%",
                }}
                frameBorder={0}
              ></iframe>
            </div>
          </div>
          <h4>Feature Queries</h4>
          <p>
            For very simple fallbacks, the overriding method shown previously
            may work. It can however require that you order the declarations and
            rules in your CSS carefully, making it more brittle than you might
            like. You may also run into problems when you want to use additional
            CSS to enhance the layout in newer browsers, if that CSS is also
            understood by older browsers.
          </p>
          <p>
            In the next demo, I have given the left-hand column a background
            color. I only want this to apply to the CSS Grid layout, where I can
            ensure that the columns will be the same height as each other.
            However, using the previous method the background color is
            understood and therefore used by browsers without CSS Grid support
            too. I have also added widths to the floated elements. As a
            percentage width is interpreted by the grid layout as a percentage
            of the column track, this causes the columns to become narrower than
            the track.
          </p>
          <div className="code-snippet">
            <div className="codepen">
              <iframe
                id="cp_embed_MWJVaqm"
                src="https://codepen.io/rachelandrew/embed/gOmrXqQ?height=450&amp;theme-id=1&amp;slug-hash=gOmrXqQ&amp;default-tab=css,result"
                scrolling="no"
                allowFullScreen={false}
                title="Modern CSS 2.3 before"
                className="codepen"
                loading="lazy"
                style={{
                  width: "100%",
                  overflow: "hidden",
                  height: "100%",
                }}
                frameBorder={0}
              ></iframe>
            </div>
          </div>
          <p>
            In situations like this, CSS Feature Queries are useful. A feature
            query is similar to a media query, however instead of testing to see
            how large the viewport is, we are testing to see if a browser has
            support for that feature.
          </p>
          <p>
            Introducing a Feature Query into our demo means that we can wrap up
            all of our grid code with a test to see if the browser supports
            <code>display: grid</code>.
          </p>
          <div className="code-snippet">
            <div className="codepen">
              <iframe
                id="cp_embed_MWJVaqm"
                src="https://codepen.io/rachelandrew/embed/xxqVPjq?height=450&amp;theme-id=1&amp;slug-hash=MWJVaqm&amp;default-tab=css,result"
                scrolling="no"
                allowFullScreen={false}
                title="Modern CSS 2.3 after"
                className="codepen"
                loading="lazy"
                style={{
                  width: "100%",
                  overflow: "hidden",
                  height: "100%",
                }}
                frameBorder={0}
              ></iframe>
            </div>
          </div>
          <p>
            Feature Queries are a simple test to see if the browser can parse a
            given declaration. They can’t tell you if the browser supports that
            feature without bugs, however with a good knowledge of browser
            support they can be a great way to safely add enhancements to a
            design. In the next article we will look at some more realistic
            components and how to use this method to build in progressively
            enhanced support.
          </p>
          <div className="article-sidebar">
            <p>
              You can also test for feature support using JavaScript,{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports">
                using CSS.supports()
              </a>
              . As with Feature Queries in CSS, this function takes a property
              and value as arguments. Therefore, to test for CSS Grid layout
              support, you would use:
            </p>
            <div className="code-snippet">
              <code>
                <span className="code-c">let</span>{" "}
                <span className="code-m">result</span> ={" "}
                <span className="code-c">CSS</span>.
                <span className="code-y">supports</span>(“display”, “grid”);
              </code>
            </div>
            <p>
              The returned result is true or false, indicating if the browser
              does or does not have support.
            </p>
          </div>
          <h4>Vendor prefixes</h4>
          <p>
            The browser compat tables on MDN will also tell you if the property
            or value you want to use needs to be prefixed. Vendor prefixes are a
            way for browsers to ship their own experimental CSS features that
            won’t interfere with the standard version of the property, as well
            as browser-specific proprietary features, using a prepended prefix.
          </p>
          <p>Prefixes used in major browsers are as follows:</p>
          <ul>
            <li>
              -webkit- (Chrome, Safari, newer versions of Opera, Edge after
              version 79, almost all iOS browsers including Firefox for iOS, any
              other Chromium-based browsers not already mentioned — including
              Brave, Samsung Internet, etc.)
            </li>
            <li>-moz- (Firefox)</li>
            <li>-o- (old pre-Chromium versions of Opera)</li>
            <li>
              -ms- (Internet Explorer and Microsoft Edge prior to version 79.)
            </li>
          </ul>
          <p>
            This sounds OK in principle, but properties tended to stay prefixed
            for a long time, and web developers saw the functionality and began
            using them in production code. There are still a few properties and
            values that are used with prefixed names, and this is indicated in
            the browser compat tables with a star, for example see the data for
            <code>background-clip: text</code>, which indicates you should use a
            prefix.
          </p>
          <p>
            When using a prefixed property, you should add the prefixed version
            or versions, then the standard property name. For example:
          </p>
          <div className="code-snippet">
            <code>
              .example {`{`}
              <br />
              <span className="code-c">-webkit-background-clip:</span>{" "}
              <span className="code-m">text</span>;
              <br />
              <span className="code-c">background-clip:</span>{" "}
              <span className="code-m">text</span>;
              <br />
              {`}`}
            </code>
          </div>
          <p>
            By putting the standardized property last, you can ensure that
            browsers that only support a prefixed version of the property will
            use the version they understand, whereas browsers that support the
            standard version of the property will override the prefixed
            implementation and use that instead. This is most likely what you
            want &mdash; all browsers using the standard version wherever
            possible.
          </p>
          <h3>Third party tools</h3>
          <p>
            If you can create fallbacks and support browsers using the
            techniques outlined above, this is likely to be the most robust way
            of creating fallbacks. Using built-in features of the web platform
            is the best way to create a resilient site. However, sometimes you
            will need to reach for other tools built on top of the web platform
            by the community. Here we’ll look specifically at the PostCSS tool,
            and more generally at the concept of Polyfills.
          </p>
          <h4>PostCSS</h4>
          <p>
            <a href="https://postcss.org/">PostCSS</a> is a JavaScript utility
            that you run on your CSS files to perform various tasks. We’ll be
            looking specifically at features that help with browser
            compatibility, although it does include other tools that can help
            streamline your work.
          </p>
          <p>
            Adding vendor prefixes is a good introduction to how PostCSS works.
            Consulting MDN to see if you need vendor prefixes can be a bit
            time-consuming, so you can use the{" "}
            <a href="https://github.com/postcss/autoprefixer">
              Autoprefixer plugin
            </a>{" "}
            for PostCSS to do that check for you and add them to your file only
            when needed. The nice thing about adding these prefixes with
            Autoprefixer is that it will stop adding prefixes when they are no
            longer required.
          </p>
          <p>
            Autoprefixer works best where there is no difference in
            functionality between the prefixed and unprefixed versions.
            Autoprefixer can add support for the <code>-ms-prefixed</code>{" "}
            version of CSS Grid, however the version that shipped in Internet
            Explorer 10 is fundamentally different to the final specification,
            and is missing various core features. To use it, you essentially
            need to write your CSS with IE10 in mind &mdash; it’s not “set and
            forget” in the way that the rest of Autoprefixer is and therefore is
            turned off by default.
          </p>
          <p>
            Another handy PostCSS plugin is{" "}
            <a href="https://preset-env.cssdb.org/">postcss-preset-env</a>. This
            tool lets you “write tomorrow’s CSS today”, meaning that you can use
            features that don’t have great support, or more modern syntax, and
            postcss-preset-env will automatically update your CSS to equivalent
            syntax that is better supported. Not everything can be supported but
            a large number of features are.
          </p>
          <p>
            When using any PostCSS feature, you will need to check that the
            output and browser support is as you expected. If you are running
            into issues, you may have an extra place where a bug could have
            crept in. If something isn’t working as you expect, is it a browser
            bug or a bug in a tool you are using? This does create a potential
            extra element of risk, although these tools can be great timesavers
            when used carefully.
          </p>
          <h4>Polyfills</h4>
          <p>
            A polyfill is a piece of code that implements a feature in a browser
            that does not natively support it. This will usually be in the form
            of a JavaScript library, such as{" "}
            <a href="https://github.com/nuxodin/ie11CustomProperties">
              this polyfill
            </a>{" "}
            which adds support for custom properties to IE11.
          </p>
          <p>
            Polyfills are different to the PostCSS plugins we have already
            explored. PostCSS plugins rewrite your CSS to use better-supported
            properties, or to add vendor prefixes, and these changes happen as
            part of a compile step before deploying the site to a server.
            Polyfills are part of the JavaScript that runs on your site and is
            downloaded by every visitor. This means that you should carefully
            assess their use as they have the potential to slow down the site
            and create a worse experience for the people you are trying to help.
          </p>
          <p>
            For example, it would be possible to use JavaScript to replicate CSS
            Grid functionality in a browser that does not support it. The result
            however would be a janky experience &mdash; we have to wait until
            the page has fully loaded before polyfills can get to work, which
            results in a second rendering of the page, and a CSS Grid polyfill
            would result in elements being shifted around by JavaScript. It
            would most likely be a far worse experience than serving users of
            that browser a simpler layout. Therefore with polyfills, just
            because you can, doesn’t mean you should!
          </p>
          <p>
            The future of polyfills looks a lot brighter as Houdini becomes
            better supported in browsers. Houdini is a collection of browser
            APIs that allow developers to extend CSS and make changes to the
            rendering process. This will provide a way of adding features that
            doesn’t cause the jankiness of current polyfills.
          </p>
          <p>
            Once Houdini is well-supported, a new feature shipping in one
            browser could quickly have a polyfill making it work in others,
            prior to them implementing their own support.
          </p>
          <h3>Testing</h3>
          <p>
            Testing in various browsers and devices should be part of your
            development workflow. Don’t leave it right until the end &mdash;
            many issues are easy to deal with when looking at a single component
            but will seem overwhelming when you are faced with an entire
            application, or even a whole page that is displaying badly.
          </p>
          <p>
            You should first look at installing a decent selection of browsers
            to test in. No matter which operating system you are running you
            will be able to install Chrome and Firefox. macOS users can also
            install Safari. Many other browsers &mdash; including Microsoft Edge
            &mdash; are now based on Chromium, the engine behind Chrome.
            However, bear in mind that you should still test in them &mdash; not
            all of these browsers are running the same version of Chromium as
            the release version of Chrome.
          </p>
          <p>
            It’s likely that you also have access to a phone and a tablet, which
            can have mobile browsers installed &mdash; these devices can be used
            to test the mobile experience of your site.
          </p>
          <div className="article-sidebar">
            <p>
              Note that, while you can install Firefox and other browsers on an
              iOS device, these browsers all use WebKit, the engine behind
              Safari, to render web pages. In addition, it can be worth getting
              an inexpensive Android device, especially if you are an iPhone
              user. By purchasing a low-end Android device, you can not only
              ensure that you are testing in Mobile Chrome, but also check out
              the experience of your site on a device that is less powerful than
              your usual phone.
            </p>
          </div>
          <p>
            In a larger company you may well be able to set up a testing lab
            with a few different versions of browsers, and some mobile devices
            for testing. Even as a lone developer, if you are a Windows user it
            may be worth picking up an inexpensive second-hand Apple laptop,
            just check that your site can run on macOS browsers.
          </p>
          <p>
            To access more versions of browsers there are online services than
            allow you to test sites on a browser running in a virtual machine.
            BrowserStack is one such service, which allows you to choose an
            operating system, browser, and version combination. This can be a
            very useful tool if you get a bug report on your site from an
            unusual or particularly old browser that you do not have access to.
          </p>
          <p>
            n this article you have learned that we have many tools available to
            help support and test in browsers. The last section of this guide
            will demonstrate how to use these when developing some common
            components, with practical examples.
          </p>
        </article>
      </div>
      <DeepDivesFeature />
      <div className="deep-dive-article-footer previous">
        <p className="girdle">
          <a href={`/${locale}/plus/deep-dives/planning-for-browser-support`}>
            <span className="previous-article">Previous article</span> Planning
            for browser support
          </a>
        </p>
      </div>
    </>
  );
}
