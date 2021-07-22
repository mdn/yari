import { useEffect } from "react";
import { useParams } from "react-router-dom";

import ArticleMeta from "../../ui/molecules/article-meta";
import Byline from "../../ui/organisms/byline";
import DeepDivesFeature from "../../ui/organisms/deep-dives-feature";
import SeriesCard from "../../ui/molecules/series-card";
import Survey from "../../ui/organisms/survey";

import "./index.scss";

export default function PlanningForBrowserSupport() {
  useEffect(() => {
    document.title = "Planning for browser support ~ Plus";
  }, []);
  const { locale } = useParams();
  const seriesList = [
    {
      displayName: "Planning for browser support",
      url: "planning-for-browser-support",
      state: "active",
    },
    {
      displayName: "Your browser support toolkit",
      url: "your-browser-support-toolkit",
    },
    {
      displayName: "Practical browser support",
      url: "#",
      state: "unavailable",
    },
  ];

  return (
    <>
      <div className="main-article-page-content-container girdle">
        <article className="deep-dive-article-container">
          <header className="main-heading-group heading-group">
            <h1>Planning for browser support</h1>
            <h2>Modern CSS in the real world : Part one</h2>
          </header>
          <p className="article-lead">
            Learn about the types of CSS issues you’ll be facing when working
            with your team in a web-based environment and tips for developing a
            future-proof support strategy.
          </p>
          <Byline
            avatar="rachel-andrew.png"
            author="Rachel Andrew"
            authorDescription="MDN Editor &amp; Writer, Former Editor in Chief of Smashing Magazine"
          />
          <ArticleMeta
            publishDate="March 29th, 2021"
            readTime="12 minute read"
          />
          <p>
            <img
              className="feature-image"
              src="/assets/article-images/planning-for-browser-support.svg"
              width="782"
              height="440"
              alt="illustration of various tech devices and browser windows"
            />
          </p>
          <p>
            To some extent, life as a CSS developer has never been better. We
            have new features for layout in Flexbox and Grid, which are designed
            for the websites and applications we are building today. With every
            new browser version, new features are announced. Many of these solve
            problems that developers have struggled with since CSS started to
            appear in browsers.
          </p>
          <p>
            However, every time a new feature lands in one browser, someone will
            point out that it isn’t usable yet due to lack of support in other
            browsers. We are often caught between wanting to learn and be
            excited about new possibilities, and the reality of needing to
            support users on older, less capable browsers.
          </p>
          <p>
            Sometimes the biggest problem is in talking about browser support
            with other stakeholders who might be worried that a less
            fully-featured version of the site in an old browser will damage
            their brand, or cost them customers. It therefore makes sense to
            start off here by thinking about what types of browser support
            problems we might have, and how to talk to our team, boss, or client
            about them.
          </p>
          <p>
            With regard to CSS, the issues we will be discussing are very
            similar on desktop and on mobile; by writing your CSS in a resilient
            way you can ensure that everyone can get a great experience on your
            site.
          </p>
          <h3>Types of compatibility problems</h3>
          <p>
            There are three distinct groups of compatibility issues you are
            likely to encounter in your work. It’s worth identifying which ones
            you are facing early on in the planning process, as the approaches
            for dealing with them can differ somewhat.
          </p>
          <h4>Browsers that are locked in the past</h4>
          <p>
            In the past, browsers were released on a cycle that meant new
            versions appeared very slowly. If you consider that version 1 of
            Internet Explorer was released in 1995, and Internet Explorer 11
            came out in 2013, that’s only 11 versions of IE in almost 20 years!
            Due to this, the most current version of a browser could be quite
            out of date in terms of feature support. In addition new versions
            often contained breaking changes and so individuals and IT
            departments would not update their browsers due to fears of sites
            and systems that they relied upon breaking.
          </p>
          <p>
            This is a problem that is going away with browsers moving to an
            evergreen, constantly updating, model. This means smaller feature
            releases happening on a regular basis, quietly updating the user’s
            browser without risk of breaking things. As an example, a new
            version of Firefox is usually released every 4 weeks as of the time
            of writing.
          </p>
          <p>
            For most of us, the last browser based on the old release model that
            we might need to continue supporting is Internet Explorer 11. IE11
            is still used by enough people to worry about (depending on your
            target audience), yet with lacking or buggy support for a raft of
            modern features. Browsers such as IE11 however are a known entity.
            It is relatively straightforward to check whether a feature is
            supported or not in our compatibility tables.
          </p>
          <p>
            Later on in this guide you will find out how to write CSS that
            creates a fallback for Internet Explorer, which it can use when
            presented with code it does not understand.
          </p>
          <h4>Browsers that support a feature but have bugs</h4>
          <p>
            CSS is defined by the CSS specifications (specs); you’ll find a link
            to the spec for any feature at the bottom of its MDN page. These
            specs detail how browsers should implement a feature, the goal being
            that each browser will implement the feature in exactly the same
            way. Modern CSS specs are very detailed, and written with input from
            engineers who work on all of the major browsers, which is one reason
            why we have far fewer bugs in modern browsers than we saw in the
            past.
          </p>
          <p>
            However, sometimes differences appear between browser
            implementations. Perhaps the spec wasn’t quite detailed enough, or a
            problem doesn’t show up until the new CSS property interacts with
            some other part of CSS, or a mistake is made when implementing the
            feature. Bugs happen in software development, and browsers are no
            different.
          </p>
          <p>
            Being able to identify if the difference you are seeing between two
            browsers is a bug, and exactly what is causing the bug, is a key
            skill for a front-end developer. Later in this guide, you’ll learn
            how to create a reduced test case to isolate the problem, decide on
            a strategy for working round it, and report the issue to a browser
            vendor to get it fixed!
          </p>
          <h4>Browsers which don’t support a feature yet</h4>
          <p>
            The biggest category of compatibility issues is never going to go
            away. New CSS will never land in all browsers at the same time, nor
            will all users update at exactly the same time, even with evergreen
            browsers. Therefore, it’s important to have a strategy for using new
            features as an enhancement, while giving the non-supporting browsers
            a perfectly solid experience. The good news is that CSS has evolved
            to make this much easier for you, and later on you will learn how to
            use CSS to create sites that evolve as browsers do, giving yourself
            the ability to use these new features before there is widespread
            support.
          </p>
          <h3>What does “supporting a browser” mean to you?</h3>
          <p>
            When having discussions with a client, your boss, or your team,
            about browser support, it’s vital that you are all talking about the
            same thing. Let’s take Internet Explorer 11 as an example. You might
            feel that, based on the analytics for your existing site, and what
            you know of your target audience, that your new site could use a
            bunch of features that aren’t supported by IE11.
          </p>
          <p>
            Let's say your aim would be to still support IE11, but with an
            equivalent, simpler experience. You would not lock out IE11 users,
            or leave the site looking a mess in their browser &mdash; you would
            still test what the experience is. However, you would not attempt to
            present those users with the full design experience. Your idea of
            support is that IE11 users get a usable yet simple site.
          </p>
          <p>
            However, when you talk to your client and mention that modern
            Microsoft browsers will be given the full experience, meaning Edge,
            they may interpret that as meaning you are going to make it
            impossible for Internet Explorer users to visit the site. Their idea
            of support is probably more binary &mdash; you get the full
            experience or nothing!
          </p>
          <p>
            Make sure that, before you begin to plan your support strategy, you
            are all talking about the same thing when you talk about{" "}
            <strong>supporting a browser</strong>.
          </p>
          <div className="article-sidebar">
            <p>
              Back when Internet Explorer 6 was the main browser causing us
              problems, the front-end team at Yahoo! came up with a useful way
              of describing support.{" "}
              <a href="https://github.com/yui/yui3/wiki/Graded-Browser-Support">
                Graded Browser Support
              </a>{" "}
              placed browsers into groups.
            </p>
            <ul>
              <li>
                A-grade browsers got all of the features and the site was tested
                in all of these browsers.
              </li>
              <li>
                C-grade browsers were known to be older or less capable. A
                subset of these browsers were tested to make sure they were not
                getting a broken experience, but they were served semantic HTML
                only.
              </li>
              <li>
                X-grade browsers were unknown, but assumed capable and modern
                until the team were informed otherwise.
              </li>
            </ul>
            <p>
              This predates evergreen browsers and therefore deals with a field
              that was far slower moving than today, however web developers at
              the time found this approach helpful. Our modern support
              strategies can be seen as an evolution of this idea.
            </p>
          </div>
          <h3>Creating a browser support strategy for your project</h3>
          <p>
            Along with performance and accessibility, considering browser
            support from the beginning of your project will make the process far
            easier. No one wants to be in the situation of sending a completed
            site to a client and having them on the phone 10 minutes later
            complaining about a mess in their favorite browser!
          </p>
          <p>
            By creating a strategy, and making decisions up front, you can test
            against key browsers as you work. If a problem comes up that
            requires a feature not supported by some target browser, you have a
            good basis for discussing it and deciding if an exception can be
            made or a polyfill found.
          </p>
          <p>
            Your support strategy should detail which browsers you intend to
            test the site in and of those, the versions that you expect to get a
            generally comparable experience. A common baseline for evergreen
            browsers seems to be the last two versions of the browser. Remember
            to include mobile browsers in your plan.
          </p>
          <p>
            It should also detail how you intend to deal with specific older
            browsers that users may be locked into, such as IE11, and general
            unknown older browsers that may show up. So, you might outline that
            you will test in IE11, and will aim to give users of that browser a
            good experience. You will however provide a simplified layout, and
            not attempt to completely recreate the same design that the modern
            browsers are getting.
          </p>
          <p>
            To help you decide which browsers to include, and perhaps to help
            you argue your case when faced with team members who want things to
            “look the same” in all browsers, consider the following points.
          </p>
          <h4>What do you know about your users?</h4>
          <p>
            If you are redesigning or adding to an existing site, you may
            already have a good amount of information about the browsers and
            devices people are using to access your site from your analytics.
            You should be able to find out how many users are using old versions
            of Internet Explorer, how many are on mobile devices, and which
            versions of evergreen browsers that are in use.
          </p>
          <p>
            If you don’t have your own analytics information then you could look
            at general statistics for the locations your users are likely to be
            in. Statcounter (
            <a href="https://gs.statcounter.com/">
              https://gs.statcounter.com/
            </a>
            ) is a good place to look at the browser versions currently in use,
            and can be filtered by location
          </p>
          <p>
            If you have a narrow audience, then you may be able to use user
            interviews to find out if this audience is more likely to be locked
            into an old browser.
          </p>
          <div className="notecard note">
            <p>
              Provide some kind of well-designed summary chart graphic, which
              people can use to refresh their memories quickly, and grab and
              adapt for their own support chart.
            </p>
            <p>
              Something like "Full support browsers: Last 3 versions of Fx
              desktop/mobile, Chrome desktop/mobile, Safari desktop/mobile
              ....etc. Limited semantic HTML: IE 11 etc."
            </p>
          </div>
          <h4>Where is it best to spend your time and money?</h4>
          <p>
            The fact is that, even if you don’t want to use all the new bells
            and whistles in CSS, basing your design on new features such as
            flexbox and grid is likely to make development faster. CSS based on
            modern layout techniques rather than carefully calculated floats
            will be less fragile. This will make future feature additions easier
            too.
          </p>
          <p>
            If you decide that it is important for Internet Explorer users to
            see the exact same layout as those using up-to-date Firefox or
            Chrome, then you have two choices.
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
            budget and time, then using it to ensure a high level of
            accessibility, or improving performance, is likely to benefit far
            more people.
          </p>
          <p>
            This can be a compelling argument when trying to modernize your
            support policy. Using older methods, and in particular trying to
            recreate a complex design using those methods, can actively slow
            down your site. Slow sites are penalized by search engines, and by
            users who don’t want to wait for heavy pages to load. Are you
            willing to lose those users in order to provide the full design to
            users of older browsers?
          </p>
          <div className="article-sidebar">
            <p>
              Google will start using{" "}
              <a href="https://developers.google.com/search/docs/guides/page-experience">
                Page experience
              </a>{" "}
              as a ranking signal in June 2021. This includes the information
              included in{" "}
              <a href="https://web.dev/vitals/#core-web-vitals">
                Core Web Vitals
              </a>
              , which relate primarily to speed and layout stability on your
              site.
            </p>
            <p>
              A site using JavaScript to achieve modern layout in old browsers,
              for example, is likely to rank poorly in some of these metrics.
            </p>
          </div>
          <h4>Core design elements vs. enhancements</h4>
          <p>
            As you build your site you will be testing your support policy
            against big things, such as using CSS grid for your layout, and
            small things — little enhancements that add some delight but
            wouldn’t be missed if they didn’t appear.
          </p>
          <p>
            For example, the{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter">
              backdrop-filter
            </a>{" "}
            property is not currently supported in Firefox. It might be ideal
            for an image and text treatment that you have in mind. Would your
            policy allow for using this with a fallback to a solid color in
            Firefox?
          </p>
          <p>
            Or, consider the subgrid feature of CSS Grid Layout, which is
            currently only available in Firefox. You might decide that relying
            on this feature is not appropriate, but be happy to use it to get
            better alignment across some components, knowing that as it ships in
            Chrome and other browsers they will get the better experience too.
          </p>
          <div className="article-sidebar">
            <p>
              Later in this guide you will learn how to implement enhancements
              such as these in a way that doesn’t rely on browser detection.
              This means that if you decide to go with a fallback for
              non-supporting browsers, as soon as the browser implements the
              feature, users will get the full effect.
            </p>
          </div>
          <h4>Show, don’t tell</h4>
          <p>
            Even after talking things through and creating what you believe is a
            solid policy for browser support, there is always the chance that
            the reality of seeing the much plainer site in IE11 will come as a
            shock to someone.
          </p>
          <p>
            If possible, show the team an example of what you are talking about.
            That could be a design for the expected IE version vs. the modern
            layout version, a page or section of the site built in HTML and CSS,
            or a demonstration of another similar site that has taken this
            approach. Often people will be worried that their brand guidelines
            might get lost in the low-fi version of the site, and demonstrating
            that you will take the same care with those key things in the
            simpler layout as you do with the modern layout will help calm any
            concerns.
          </p>
          <h3>Keep your strategy up-to-date</h3>
          <p>
            Unless your site is a one-off, handed over to a client and never
            seen again, it is likely that you will be adding new features to the
            site in future. When planning these new features, remember to refer
            back to and consider updating your strategy in the light of browser
            and audience changes. Old Internet Explorer browsers will go away,
            new features will be developed, and you don’t want to be dragging
            the support requirements of the past along with you for the entire
            lifetime of the site.
          </p>
          <p>
            Once you have created your strategy, and can easily discuss features
            with the rest of the team, it’s time to move onto understanding the
            tools that you have to implement a robust site that supports as many
            users as possible.
          </p>
        </article>
        <div className="deep-dive-article-sidebar">
          <SeriesCard
            title="Modern CSS in the real world"
            seriesList={seriesList}
          />
        </div>
      </div>
      <DeepDivesFeature />
      <Survey />
      <div className="deep-dive-article-footer">
        <p className="girdle">
          <a href={`/${locale}/plus/deep-dives/your-browser-support-toolkit`}>
            <span className="next-article">Next article</span> Your browser
            support toolkit
          </a>
        </p>
      </div>
    </>
  );
}
