import { useParams } from "react-router-dom";

import { ArticleMeta } from "./article-meta";
import { Byline } from "./byline";

export function PlanningForBrowserSupport() {
  const { locale } = useParams();
  return (
    <article className="deep-dive-article-container">
      <header className="main-heading-group heading-group">
        <h1>Planning for browser support</h1>
        <h2>
          <a href={`/${locale}/plus/deep-dives`}>
            Modern CSS in the Real World
          </a>{" "}
          : Part one
        </h2>
      </header>
      <p className="article-lead">
        Learn about the types of CSS issues you’ll be facing when working with
        your team in a web-based environment and tips for developing a
        future-proof support strategy
      </p>
      <Byline
        avatar="rachel-andrew.png"
        author="Rachel Andrew"
        authorDescription="CSS WG Invited Expert"
        authorBioURLs={[
          { url: "https://twitter.com/rachelandrew", text: "@rachelandrew" },
          { url: "https://rachelandrew.co.uk", text: "rachelandrew.co.uk" },
        ]}
      />
      <ArticleMeta publishDate="March 29th, 2021" readTime="12 minute read" />
      <p>
        <img
          className="feature-image"
          src="/assets/deepdives/planning-for-browser-support.svg"
          width="782"
          height="440"
          alt="illustration of various tech devices and browser windows"
        />
      </p>
      <p>
        To some extent, life as a CSS developer has never been better. We have
        new features for layout in Flexbox and Grid, which are designed for the
        websites and applications we are building today. With every new browser
        version, new features are announced. Many of these solve problems that
        developers have struggled with since CSS started to appear in browsers.
      </p>
      <p>
        However, every time a new feature lands in one browser, someone will
        point out that it isn’t usable yet due to lack of support in other
        browsers. We are often caught between wanting to learn and be excited
        about new possibilities, and the reality of needing to support users on
        older, less capable browsers.
      </p>
      <p>
        Sometimes the biggest problem is in talking about browser support with
        other stakeholders who might be worried that a less fully-featured
        version of the site in an old browser will damage their brand, or cost
        them customers. It therefore makes sense to start off here by thinking
        about what types of browser support problems we might have, and how to
        talk to our team, boss, or client about them.
      </p>
      <p>
        With regard to CSS, the issues we will be discussing are very similar on
        desktop and on mobile; by writing your CSS in a resilient way you can
        ensure that everyone can get a great experience on your site.
      </p>
      <h3>Types of compatibility problems</h3>
      <p>
        There are three distinct groups of compatibility issues you are likely
        to encounter in your work. It’s worth identifying which ones you are
        facing early on in the planning process, as the approaches for dealing
        with them can differ somewhat.
      </p>
      <h4>Browsers that are locked in the past</h4>
      <p>
        In the past, browsers were released on a cycle that meant new versions
        appeared very slowly. If you consider that version 1 of Internet
        Explorer was released in 1995, and Internet Explorer 11 came out in
        2013, that’s only 11 versions of IE in almost 20 years! Due to this, the
        most current version of a browser could be quite out of date in terms of
        feature support. In addition new versions often contained breaking
        changes and so individuals and IT departments would not update their
        browsers due to fears of sites and systems that they relied upon
        breaking.
      </p>
      <p>
        This is a problem that is going away with browsers moving to an
        evergreen, constantly updating, model. This means smaller feature
        releases happening on a regular basis, quietly updating the user’s
        browser without risk of breaking things. As an example, a new version of
        Firefox is usually released every 4 weeks as of the time of writing.
      </p>
      <p>
        For most of us, the last browser based on the old release model that we
        might need to continue supporting is Internet Explorer 11. IE11 is still
        used by enough people to worry about (depending on your target
        audience), yet with lacking or buggy support for a raft of modern
        features. Browsers such as IE11 however are a known entity. It is
        relatively straightforward to check whether a feature is supported or
        not in our compatibility tables.
      </p>
      <p>
        Later on in this guide you will find out how to write CSS that creates a
        fallback for Internet Explorer, which it can use when presented with
        code it does not understand.
      </p>
      <h4>Browsers that support a feature but have bugs</h4>
      <p>
        CSS is defined by the CSS specifications (specs); you’ll find a link to
        the spec for any feature at the bottom of its MDN page. These specs
        detail how browsers should implement a feature, the goal being that each
        browser will implement the feature in exactly the same way. Modern CSS
        specs are very detailed, and written with input from engineers who work
        on all of the major browsers, which is one reason why we have far fewer
        bugs in modern browsers than we saw in the past.
      </p>
      <p>
        However, sometimes differences appear between browser implementations.
        Perhaps the spec wasn’t quite detailed enough, or a problem doesn’t show
        up until the new CSS property interacts with some other part of CSS, or
        a mistake is made when implementing the feature. Bugs happen in software
        development, and browsers are no different.
      </p>
      <p>
        Being able to identify if the difference you are seeing between two
        browsers is a bug, and exactly what is causing the bug, is a key skill
        for a front-end developer. Later in this guide, you’ll learn how to
        create a reduced test case to isolate the problem, decide on a strategy
        for working round it, and report the issue to a browser vendor to get it
        fixed!
      </p>
      <h4>
        Browsers which don’t support a feature <em>yet</em>
      </h4>
      <p>
        The biggest category of compatibility issues is never going to go away.
        New CSS will never land in all browsers at the same time, nor will all
        users update at exactly the same time, even with evergreen browsers.
        Therefore, it’s important to have a strategy for using new features as
        an enhancement, while giving the non-supporting browsers a perfectly
        solid experience. The good news is that CSS has evolved to make this
        much easier for you, and later on you will learn how to use CSS to
        create sites that evolve as browsers do, giving yourself the ability to
        use these new features before there is widespread support.
      </p>
      <h3>What does “supporting a browser” mean to you?</h3>
      <p>
        When having discussions with a client, your boss, or your team, about
        browser support, it’s vital that you are all talking about the same
        thing. Let’s take Internet Explorer 11 as an example. You might feel
        that, based on the analytics for your existing site, and what you know
        of your target audience, that your new site could use a bunch of
        features that aren’t supported by IE11.
      </p>
      <p>
        Let's say your aim would be to still support IE11, but with an
        equivalent, simpler experience. You would not lock out IE11 users, or
        leave the site looking a mess in their browser &mdash; you would still
        test what the experience is. However, you would not attempt to present
        those users with the full design experience. Your idea of support is
        that IE11 users get a usable yet simple site.
      </p>
      <p>
        However, when you talk to your client and mention that modern Microsoft
        browsers will be given the full experience, meaning Edge, they may
        interpret that as meaning you are going to make it impossible for
        Internet Explorer users to visit the site. Their idea of support is
        probably more binary &mdash; you get the full experience or nothing!
      </p>
      <p>
        Make sure that, before you begin to plan your support strategy, you are
        all talking about the same thing when you talk about{" "}
        <strong>supporting a browser</strong>.
      </p>
      <div className="article-sidebar">
        <p>
          Back when Internet Explorer 6 was the main browser causing us
          problems, the front-end team at Yahoo! came up with a useful way of
          describing support.{" "}
          <a href="https://github.com/yui/yui3/wiki/Graded-Browser-Support">
            Graded Browser Support
          </a>{" "}
          placed browsers into groups.
        </p>
        <ul>
          <li>
            A-grade browsers got all of the features and the site was tested in
            all of these browsers.
          </li>
          <li>
            C-grade browsers were known to be older or less capable. A subset of
            these browsers were tested to make sure they were not getting a
            broken experience, but they were served semantic HTML only.
          </li>
          <li>
            X-grade browsers were unknown, but assumed capable and modern until
            the team were informed otherwise.
          </li>
        </ul>
        <p>
          This predates evergreen browsers and therefore deals with a field that
          was far slower moving than today, however web developers at the time
          found this approach helpful. Our modern support strategies can be seen
          as an evolution of this idea.
        </p>
      </div>
      <h3>Creating a browser support strategy for your project</h3>
      <p>
        Along with performance and accessibility, considering browser support
        from the beginning of your project will make the process far easier. No
        one wants to be in the situation of sending a completed site to a client
        and having them on the phone 10 minutes later complaining about a mess
        in their favorite browser!
      </p>
      <p>
        By creating a strategy, and making decisions up front, you can test
        against key browsers as you work. If a problem comes up that requires a
        feature not supported by some target browser, you have a good basis for
        discussing it and deciding if an exception can be made or a polyfill
        found.
      </p>
      <p>
        Your support strategy should detail which browsers you intend to test
        the site in and of those, the versions that you expect to get a
        generally comparable experience. A common baseline for evergreen
        browsers seems to be the last two versions of the browser. Remember to
        include mobile browsers in your plan.
      </p>
      <p>
        It should also detail how you intend to deal with specific older
        browsers that users may be locked into, such as IE11, and general
        unknown older browsers that may show up. So, you might outline that you
        will test in IE11, and will aim to give users of that browser a good
        experience. You will however provide a simplified layout, and not
        attempt to completely recreate the same design that the modern browsers
        are getting.
      </p>
      <p>
        To help you decide which browsers to include, and perhaps to help you
        argue your case when faced with team members who want things to “look
        the same” in all browsers, consider the following points.
      </p>
      <h4>What do you know about your users?</h4>
      <p>
        If you are redesigning or adding to an existing site, you may already
        have a good amount of information about the browsers and devices people
        are using to access your site from your analytics. You should be able to
        find out how many users are using old versions of Internet Explorer, how
        many are on mobile devices, and which versions of evergreen browsers
        that are in use.
      </p>
      <figure>
        <img
          src="/assets/deepdives/planning-for-browser-support01.png"
          width="782"
          height="346"
          alt=""
        />
        <figcaption>
          Good Analytics dashboard showing browser usage statistics for a
          website
        </figcaption>
      </figure>
      <p>
        If you don’t have your own analytics information then you could look at
        general statistics for the locations your users are likely to be in.{" "}
        <a href="https://gs.statcounter.com/">Statcounter</a> is a good place to
        look at the browser versions currently in use, and can be filtered by
        location
      </p>
      <p>
        If you have a narrow audience, then you may be able to use user
        interviews to find out if this audience is more likely to be locked into
        an old browser.
      </p>
      <figure>
        <img
          src="/assets/deepdives/planning-for-browser-support02.png"
          width="782"
          height="346"
          alt=""
        />
        <figcaption>
          Table showing a list of fully supported browsers and a list of browser
          that will get a gracefully degraded experience
        </figcaption>
      </figure>
      <h4>Where is it best to spend your time and money?</h4>
      <p>
        The fact is that, even if you don’t want to use all the new bells and
        whistles in CSS, basing your design on new features such as flexbox and
        grid is likely to make development faster. CSS based on modern layout
        techniques rather than carefully calculated floats will be less fragile.
        This will make future feature additions easier too.
      </p>
      <p>
        If you decide that it is important for Internet Explorer users to see
        the exact same layout as those using up-to-date Firefox or Chrome, then
        you have two choices.
      </p>
      <ol>
        <li>
          You lock your new site build to the layout methods of the past.
          Methods which are slower to work with, and more fragile.
        </li>
        <li>
          You use up-to-date methods but then throw a lot of time and energy
          into trying to mirror the look and feel using old methods for the
          older browser. This will also mean limiting your use of newer
          techniques to those you can recreate using old methods.
        </li>
      </ol>
      <p>
        Neither of these options are ideal. Both result in throwing time and
        money at an ever diminishing group of users. If you have additional
        budget and time, then using it to ensure a high level of accessibility,
        or improving performance, is likely to benefit far more people.
      </p>
      <p>
        This can be a compelling argument when trying to modernize your support
        policy. Using older methods, and in particular trying to recreate a
        complex design using those methods, can actively slow down your site.
        Slow sites are penalized by search engines, and by users who don’t want
        to wait for heavy pages to load. Are you willing to lose those users in
        order to provide the full design to users of older browsers?
      </p>
      <div className="article-sidebar">
        <p>
          Google will start using{" "}
          <a href="https://developers.google.com/search/docs/guides/page-experience">
            Page experience
          </a>{" "}
          as a ranking signal in June 2021. This includes the information
          included in{" "}
          <a href="https://web.dev/vitals/#core-web-vitals">Core Web Vitals</a>,
          which relate primarily to speed and layout stability on your site.
        </p>
        <p>
          A site using JavaScript to achieve modern layout in old browsers, for
          example, is likely to rank poorly in some of these metrics.
        </p>
      </div>
      <h4>Core design elements vs. enhancements</h4>
      <p>
        As you build your site you will be testing your support policy against
        big things, such as using CSS grid for your layout, and small things —
        little enhancements that add some delight but wouldn’t be missed if they
        didn’t appear.
      </p>
      <p>
        For example, the{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter">
          backdrop-filter
        </a>{" "}
        property is not currently supported in Firefox. It might be ideal for an
        image and text treatment that you have in mind. Would your policy allow
        for using this with a fallback to a solid color in Firefox?
      </p>
      <p>
        Or, consider the subgrid feature of CSS Grid Layout, which is currently
        only available in Firefox. You might decide that relying on this feature
        is not appropriate, but be happy to use it to get better alignment
        across some components, knowing that as it ships in Chrome and other
        browsers they will get a better experience too.
      </p>
      <div className="article-sidebar">
        <p>
          Later in this guide you will learn how to implement enhancements such
          as these in a way that doesn’t rely on browser detection. This means
          that if you decide to go with a fallback for non-supporting browsers,
          as soon as the browser implements the feature, users will get the full
          effect.
        </p>
      </div>
      <h4>Show, don’t tell</h4>
      <p>
        Even after talking things through and creating what you believe is a
        solid policy for browser support, there is always the chance that the
        reality of seeing the much plainer site in IE11 will come as a shock to
        someone.
      </p>
      <p>
        If possible, show the team an example of what you are talking about.
        That could be a design for the expected IE version vs. the modern layout
        version, a page or section of the site built in HTML and CSS, or a
        demonstration of another similar site that has taken this approach.
        Often people will be worried that their brand guidelines might get lost
        in the low-fi version of the site, and demonstrating that you will take
        the same care with those key things in the simpler layout as you do with
        the modern layout will help calm any concerns.
      </p>
      <h3>Keep your strategy up-to-date</h3>
      <p>
        Unless your site is a one-off, handed over to a client and never seen
        again, it is likely that you will be adding new features to the site in
        future. When planning these new features, remember to refer back to and
        consider updating your strategy in the light of browser and audience
        changes. Old Internet Explorer browsers will go away, new features will
        be developed, and you don’t want to be dragging the support requirements
        of the past along with you for the entire lifetime of the site.
      </p>
      <p>
        Once you have created your strategy, and can easily discuss features
        with the rest of the team, it’s time to move onto understanding the
        tools that you have to implement a robust site that supports as many
        users as possible.
      </p>
    </article>
  );
}

export function YourBrowserSupportToolkit() {
  const { locale } = useParams();
  return (
    <article className="deep-dive-article-container">
      <header className="main-heading-group heading-group">
        <h1>Your browser support toolkit</h1>
        <h2>
          <a href={`/${locale}/plus/deep-dives`}>
            Modern CSS in the Real World
          </a>{" "}
          : Part two
        </h2>
      </header>
      <p className="article-lead">
        In this article discover the resources available, to help you develop a
        site that will perform well across browsers and devices
      </p>
      <Byline
        avatar="rachel-andrew.png"
        author="Rachel Andrew"
        authorDescription="CSS WG Invited Expert"
        authorBioURLs={[
          { url: "https://twitter.com/rachelandrew", text: "@rachelandrew" },
          { url: "https://rachelandrew.co.uk", text: "rachelandrew.co.uk" },
        ]}
      />
      <ArticleMeta publishDate="March 29th, 2021" readTime="18 minute read" />
      <p>
        <img
          className="feature-image"
          src="/assets/deepdives/your-browser-support-toolkit.svg"
          width="782"
          height="440"
          alt="illustration of various tech devices and browser windows"
        />
      </p>
      <p>
        Once you have a strategy and target browsers to support, you can get set
        up to develop in a robust way, considering how your site will look in
        modern browsers, and how that look will differ in older browsers. In
        this article you can find out the tools that are available to help with
        this.
      </p>
      <h3>Resources for browser support information</h3>
      <p>
        Being able to understand how well a feature is supported by browsers can
        help you decide which methods to use when building your site.
      </p>
      <p>
        For broad support information, for example “does this browser support
        CSS Grid?”, the Can I Use website is helpful.
      </p>
      <figure>
        <img
          src="/assets/deepdives/ybst001.png"
          width="783"
          height="426"
          alt=""
        />
        <figcaption>
          The support page for{" "}
          <a href="https://caniuse.com/?search=css%20grid">
            css grid on Can I Use
          </a>
        </figcaption>
      </figure>
      <p>
        For more granular information, the MDN CSS property reference pages
        provide detailed browser support tables for each property and their
        values. This can be very helpful, as additions to CSS are not always
        brand new properties &mdash; sometimes an additional value is added for
        an existing property. Take a look at the Browser Compatibility Data
        (BCD) chart for the grid-template-columns property as an example.
      </p>
      <figure>
        <img
          src="/assets/deepdives/bcd001.png"
          width="783"
          height="459"
          alt=""
        />
        <figcaption>
          Browser Compat Data (BCD) table on MDN for{" "}
          <a href="https://developer.mozilla.org/docs/Web/CSS/grid-template-columns#browser_compatibility">
            grid-template-columns
          </a>
        </figcaption>
      </figure>
      <p>
        The first line tells you the browser versions that the property was
        first supported in. Subsequent lines detail various values for
        grid-template-columns, in addition to features such as animation, which
        has variable support. As indicated by the little downward-pointing
        arrows, there is often additional information included as notes. That
        might include links to bugs raised against a browser for the feature, or
        some specific details of a compat issue.
      </p>
      <p>
        At the time of writing, if my support policy required support for the
        last two versions of evergreen browsers, this table would allow me to
        rule out using subgrid as a main layout feature due to lack of support
        in Chrome-based browsers.
      </p>
      <p>
        When writing CSS, if something isn’t working as you expect, then a quick
        look at that property on MDN can quickly tell you if the problem is lack
        of support rather than anything you are doing wrong!
      </p>
      <h4>Looking up browser bugs</h4>
      <p>
        MDN lists some major known bugs as part of BCD, however if you think you
        are seeing buggy behavior not listed on MDN then there are some other
        places to check.
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
        implemented, in addition to actual bugs where the feature is implemented
        but needs fixing as it works in a different way to that described by the
        specification, or implementations in other browsers.
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
        involved in causing the bug. For example, you might be seeing a “flexbox
        bug”, however the actual problem might be with the align-content
        property. In the next article we will work through how to go about
        identifying exactly what is causing the problem, to help make this
        easier.
      </p>
      <h4>Learning about features that are coming soon</h4>
      <p>
        A large website project might take several months to complete, in which
        time a large number of CSS features could have become available in your
        target browsers. It’s worth keeping an eye on features that are in beta
        versions of browsers, as they may be something you can use by the time
        you launch.
      </p>
      <p>
        The bug trackers mentioned previously can often give you notice that a
        feature is being included in a browser; if the bug is marked closed it
        doesn’t necessarily mean that it has shipped in the release version, but
        it may be in the beta already. Other places to look include the
        following resources:
      </p>
      <ul>
        <li>
          <a href="https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features">
            Firefox Experimental features
          </a>
        </li>
        <li>
          <a href="https://chromestatus.com/features">Chrome Platform Status</a>
        </li>
        <li>
          <a href="https://developer.apple.com/safari/technology-preview/release-notes/">
            Safari Technology Preview release notes
          </a>
        </li>
      </ul>
      <p>
        If you are taking a progressively enhanced approach, then you might be
        able to use an enhancement that doesn’t quite make the cut in terms of
        your browser support strategy at the time of coding, but is likely to by
        launch.
      </p>
      <h3>Web platform features and fallbacks</h3>
      <p>
        If you have discovered that a feature isn’t supported in a browser, but
        still intend to use it, you might need to create a fallback for browsers
        that don't support it. In addition, if you are allowing browsers without
        support to fall back to a basic layout, you need to make sure that the
        code aimed at modern browsers doesn’t leak through to older browsers and
        make a mess.
      </p>
      <p>
        In recent years creating CSS fallbacks has become much easier and CSS
        has native features that can help you. Two of the most powerful are the
        cascade and feature queries, and we'll explore these now. Later on we'll
        also look at how vendor prefixes can be a useful tool as long as they
        are used carefully.
      </p>
      <h4>Using the cascade</h4>
      <p>
        The first thing to look at is how the cascade works with properties and
        values that are not understood by a browser. We can create simple
        fallbacks by writing CSS for old browsers, then following it with CSS
        aimed at newer browsers. For example, you might want to provide a simple
        solid background color for really old browsers, and a semi-transparent
        color for newer browsers:
      </p>
      <div className="code-snippet">
        <code>
          <span className="code-c">background-color</span>: red;
          <br />
          <span className="code-c">background-color</span>: rgba(
          <span className="code-m">255</span>,<span className="code-m">0</span>,
          <span className="code-m">0</span>,<span className="code-m">0.6</span>
          );
        </code>
      </div>
      <p>
        The idea is that older browsers support the first declaration and so
        will apply it to the page, then treat the second one as invalid because
        they don't support it &mdash; this means they completely ignore it.
        Newer browsers will support both declarations, however the rules of the
        cascade mean that the declaration that comes later in the stylesheet
        will override the earlier one, and be used by the browser.
      </p>
      <p>
        CSS also has rules defining what happens when there are two potentially
        conflicting things being applied to an element. For example, if you have
        a floated item and its parent becomes a grid container, the floated item
        stops behaving like a floated item and becomes a grid item. We can see
        how this works in the following demo.
      </p>
      <p>
        In this example, the component has a simple, floated layout. This is the
        layout that browsers without CSS Grid support will use. For newer
        browsers the container has been turned into a grid container, which
        means that in a browser with CSS grid support the float is not applied.
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
        For very simple fallbacks, the overriding method shown previously may
        work. It can however require that you order the declarations and rules
        in your CSS carefully, making it more brittle than you might like. You
        may also run into problems when you want to use additional CSS to
        enhance the layout in newer browsers, if that CSS is also understood by
        older browsers.
      </p>
      <p>
        In the next demo, I have given the left-hand column a background color.
        I only want this to apply to the CSS Grid layout, where I can ensure
        that the columns will be the same height as each other. However, using
        the previous method the background color is understood and therefore
        used by browsers without CSS Grid support too. I have also added widths
        to the floated elements. As a percentage width is interpreted by the
        grid layout as a percentage of the column track, this causes the columns
        to become narrower than the track.
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
        In situations like this, CSS Feature Queries are useful. A feature query
        is similar to a media query, however instead of testing to see how large
        the viewport is, we are testing to see if a browser has support for that
        feature.
      </p>
      <p>
        Introducing a Feature Query into our demo means that we can wrap up all
        of our grid code with a test to see if the browser supports{" "}
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
        feature without bugs, however with a good knowledge of browser support
        they can be a great way to safely add enhancements to a design. In the
        next article we will look at some more realistic components and how to
        use this method to build in progressively enhanced support.
      </p>
      <div className="article-sidebar">
        <p>
          You can also test for feature support using JavaScript,{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports">
            using CSS.supports()
          </a>
          . As with Feature Queries in CSS, this function takes a property and
          value as arguments. Therefore, to test for CSS Grid layout support,
          you would use:
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
          The returned result is true or false, indicating if the browser does
          or does not have support.
        </p>
      </div>
      <h4>Vendor prefixes</h4>
      <p>
        The browser compat tables on MDN will also tell you if the property or
        value you want to use needs to be <em>prefixed</em>. Vendor prefixes are
        a way for browsers to ship their own experimental CSS features that
        won't interfere with the standard version of the property, as well as
        browser-specific proprietary features, using a prepended prefix.
      </p>
      <p>Prefixes used in major browsers are as follows:</p>
      <ul>
        <li>
          <code>-webkit-</code> (Chrome, Safari, newer versions of Opera, Edge
          after version 79, almost all iOS browsers including Firefox for iOS,
          any other Chromium-based browsers not already mentioned &mdash;
          including Brave, Samsung Internet, etc.)
        </li>
        <li>
          <code>-moz-</code> (Firefox)
        </li>
        <li>
          <code>-o-</code> (old pre-Chromium versions of Opera)
        </li>
        <li>
          <code>-ms-</code> (Internet Explorer and Microsoft Edge prior to
          version 79.)
        </li>
      </ul>
      <p>
        This sounds OK in principle, but properties tended to stay prefixed for
        a long time, and web developers saw the functionality and began using
        them in production code. There are still a few properties and values
        that are used with prefixed names, and this is indicated in the browser
        compat tables with a star, for example see the data for{" "}
        <code>background-clip: text</code>, which indicates you should use a
        prefix.
      </p>
      <p>
        When using a prefixed property, you should add the prefixed version or
        versions, then the standard property name. For example:
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
        By putting the standardized property last, you can ensure that browsers
        that only support a prefixed version of the property will use the
        version they understand, whereas browsers that support the standard
        version of the property will override the prefixed implementation and
        use that instead. This is most likely what you want &mdash; all browsers
        using the standard version wherever possible.
      </p>
      <h3>Third party tools</h3>
      <p>
        If you can create fallbacks and support browsers using the techniques
        outlined above, this is likely to be the most robust way of creating
        fallbacks. Using built-in features of the web platform is the best way
        to create a resilient site. However, sometimes you will need to reach
        for other tools built on top of the web platform by the community. Here
        we'll look specifically at the PostCSS tool, and more generally at the
        concept of Polyfills.
      </p>
      <h4>PostCSS</h4>
      <p>
        <a href="https://postcss.org/">PostCSS</a> is a JavaScript utility that
        you run on your CSS files to perform various tasks. We’ll be looking
        specifically at features that help with browser compatibility, although
        it does include other tools that can help streamline your work.
      </p>
      <p>
        Adding vendor prefixes is a good introduction to how PostCSS works.
        Consulting MDN to see if you need vendor prefixes can be a bit
        time-consuming, so you can use the{" "}
        <a href="https://github.com/postcss/autoprefixer">
          Autoprefixer plugin
        </a>{" "}
        for PostCSS to do that check for you and add them to your file only when
        needed. The nice thing about adding these prefixes with Autoprefixer is
        that it will stop adding prefixes when they are no longer required.
      </p>
      <p>
        Autoprefixer works best where there is no difference in functionality
        between the prefixed and unprefixed versions. Autoprefixer can add
        support for the <code>-ms-prefixed</code> version of CSS Grid, however
        the version that shipped in Internet Explorer 10 is fundamentally
        different to the final specification, and is missing various core
        features. To use it, you essentially need to write your CSS with IE10 in
        mind &mdash; it’s not “set and forget” in the way that the rest of
        Autoprefixer is and therefore is turned off by default.
      </p>
      <p>
        Another handy PostCSS plugin is{" "}
        <a href="https://preset-env.cssdb.org/">postcss-preset-env</a>. This
        tool lets you “write tomorrow’s CSS today”, meaning that you can use
        features that don’t have great support, or more modern syntax, and
        postcss-preset-env will automatically update your CSS to equivalent
        syntax that is better supported. Not everything can be supported but a
        large number of features are.
      </p>
      <p>
        When using any PostCSS feature, you will need to check that the output
        and browser support is as you expected. If you are running into issues,
        you may have an extra place where a bug could have crept in. If
        something isn’t working as you expect, is it a browser bug or a bug in a
        tool you are using? This does create a potential extra element of risk,
        although these tools can be great timesavers when used carefully.
      </p>
      <h4>Polyfills</h4>
      <p>
        A polyfill is a piece of code that implements a feature in a browser
        that does not natively support it. This will usually be in the form of a
        JavaScript library, such as{" "}
        <a href="https://github.com/nuxodin/ie11CustomProperties">
          this polyfill
        </a>{" "}
        which adds support for custom properties to IE11.
      </p>
      <p>
        Polyfills are different to the PostCSS plugins we have already explored.
        PostCSS plugins rewrite your CSS to use better-supported properties, or
        to add vendor prefixes, and these changes happen as part of a compile
        step before deploying the site to a server. Polyfills are part of the
        JavaScript that runs on your site and is downloaded by every visitor.
        This means that you should carefully assess their use as they have the
        potential to slow down the site and create a worse experience for the
        people you are trying to help.
      </p>
      <p>
        For example, it would be possible to use JavaScript to replicate CSS
        Grid functionality in a browser that does not support it. The result
        however would be a janky experience &mdash; we have to wait until the
        page has fully loaded before polyfills can get to work, which results in
        a second rendering of the page, and a CSS Grid polyfill would result in
        elements being shifted around by JavaScript. It would most likely be a
        far worse experience than serving users of that browser a simpler
        layout. Therefore with polyfills, just because you can, doesn’t mean you
        should!
      </p>
      <p>
        The future of polyfills looks a lot brighter as Houdini becomes better
        supported in browsers. Houdini is a collection of browser APIs that
        allow developers to extend CSS and make changes to the rendering
        process. This will provide a way of adding features that doesn’t cause
        the jankiness of current polyfills.
      </p>
      <p>
        Once Houdini is well-supported, a new feature shipping in one browser
        could quickly have a polyfill making it work in others, prior to them
        implementing their own support.
      </p>
      <h3>Testing</h3>
      <p>
        Testing in various browsers and devices should be part of your
        development workflow. Don’t leave it right until the end &mdash; many
        issues are easy to deal with when looking at a single component but will
        seem overwhelming when you are faced with an entire application, or even
        a whole page that is displaying badly.
      </p>
      <p>
        You should first look at installing a decent selection of browsers to
        test in. No matter which operating system you are running you will be
        able to install Chrome and Firefox. macOS users can also install Safari.
        Many other browsers &mdash; including Microsoft Edge &mdash; are now
        based on Chromium, the engine behind Chrome. However, bear in mind that
        you should still test in them &mdash; not all of these browsers are
        running the same version of Chromium as the release version of Chrome.
      </p>
      <p>
        It’s likely that you also have access to a phone and a tablet, which can
        have mobile browsers installed &mdash; these devices can be used to test
        the mobile experience of your site.
      </p>
      <div className="article-sidebar">
        <p>
          Note that, while you can install Firefox and other browsers on an iOS
          device, these browsers all use WebKit, the engine behind Safari, to
          render web pages. In addition, it can be worth getting an inexpensive
          Android device, especially if you are an iPhone user. By purchasing a
          low-end Android device, you can not only ensure that you are testing
          in Mobile Chrome, but also check out the experience of your site on a
          device that is less powerful than your usual phone.
        </p>
      </div>
      <p>
        In a larger company you may well be able to set up a testing lab with a
        few different versions of browsers, and some mobile devices for testing.
        Even as a lone developer, if you are a Windows user it may be worth
        picking up an inexpensive second-hand Apple laptop, just check that your
        site can run on macOS browsers.
      </p>
      <p>
        To access more versions of browsers there are online services than allow
        you to test sites on a browser running in a virtual machine.
        BrowserStack is one such service, which allows you to choose an
        operating system, browser, and version combination. This can be a very
        useful tool if you get a bug report on your site from an unusual or
        particularly old browser that you do not have access to.
      </p>
      <figure>
        <img
          src="/assets/deepdives/your-browser-support-toolkit-003.png"
          width="782"
          height="440"
          alt=""
        />
        <figcaption>
          Operating systems available on{" "}
          <a
            href="https://browserstack.com"
            className="external"
            rel="external"
          >
            Browserstack
          </a>
        </figcaption>
      </figure>
      <p>
        In this article you have learned that we have many tools available to
        help support and test in browsers. The last section of this guide will
        demonstrate how to use these when developing some common components,
        with practical examples.
      </p>
    </article>
  );
}
