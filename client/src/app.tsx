import React, { useEffect } from "react";
import {
  Navigate,
  Routes,
  Route,
  useLocation,
  useMatch,
} from "react-router-dom";

// we include our base SASS here to ensure it is loaded
// and applied before any component specific style
import "./app.scss";

import { WRITER_MODE, PLACEMENT_ENABLED, PLUS_IS_ENABLED } from "./env";
import { Homepage } from "./homepage";
import { Document } from "./document";
import { A11yNav } from "./ui/molecules/a11y-nav";
import { Footer } from "./ui/organisms/footer";
import { TopNavigation } from "./ui/organisms/top-navigation";
import { SiteSearch } from "./site-search";
import { PageNotFound } from "./page-not-found";
import { Plus } from "./plus";
import { About } from "./about";
import { getCategoryByPathname } from "./utils";
import { Community } from "./community";
import { ContributorSpotlight } from "./contributor-spotlight";
import { useIsServer, usePing } from "./hooks";

import { useGleanPage } from "./telemetry/glean-context";
import { MainContentContainer } from "./ui/atoms/page-content";
import { Loading } from "./ui/atoms/loading";
import { Advertising } from "./advertising";
import { HydrationData } from "../../libs/types/hydration";
import { TopPlacement } from "./ui/organisms/placement";
import { Blog } from "./blog";
import { Newsletter } from "./newsletter";
import { Curriculum } from "./curriculum";
import { useGA } from "./ga-context";

const AllFlaws = React.lazy(() => import("./flaws"));
const Translations = React.lazy(() => import("./translations"));
const WritersHomepage = React.lazy(() => import("./writers-homepage"));
const Sitemap = React.lazy(() => import("./sitemap"));
const Playground = React.lazy(() => import("./playground"));
const Observatory = React.lazy(() => import("./observatory"));

function Layout({ pageType, children }) {
  const { pathname } = useLocation();
  const [category, setCategory] = React.useState<string | null>(
    getCategoryByPathname(pathname)
  );

  React.useEffect(() => {
    setCategory(getCategoryByPathname(pathname));
  }, [pathname]);

  return (
    <>
      <A11yNav />
      <div
        className={`page-wrapper  ${
          category ? `category-${category}` : ""
        } ${pageType}`}
      >
        <TopPlacement />
        {!["document-page", "curriculum", "observatory"].includes(pageType) && (
          <div className="sticky-header-container without-actions">
            <TopNavigation />
          </div>
        )}
        {children}
      </div>
      <Footer />
    </>
  );
}

function LoadingFallback({ message }: { message?: string }) {
  return (
    <StandardLayout>
      <MainContentContainer standalone={true}>
        {/* This extra minHeight is just so that the footer doesn't flicker
        in and out as the fallback appears. */}
        <Loading minHeight={800} message={message || "Loading…"} />
      </MainContentContainer>
    </StandardLayout>
  );
}

function LazyStandardLayout(props: {
  pageType?: string;
  extraClasses?: string;
  children: React.ReactNode;
}) {
  const isServer = useIsServer();
  return isServer ? (
    <LoadingFallback />
  ) : (
    <React.Suspense fallback={<LoadingFallback />}>
      <StandardLayout {...props}></StandardLayout>
    </React.Suspense>
  );
}

function StandardLayout({
  pageType,
  extraClasses,
  children,
}: {
  pageType?: string;
  extraClasses?: string;
  children: React.ReactNode;
}) {
  return (
    <Layout pageType={pageType || `standard-page ${extraClasses || ""}`}>
      {children}
    </Layout>
  );
}
function DocumentLayout({ children }) {
  return <Layout pageType="document-page">{children}</Layout>;
}

function PageOrPageNotFound({ pageNotFound, children }) {
  return pageNotFound ? (
    <StandardLayout>
      <PageNotFound />
    </StandardLayout>
  ) : (
    children
  );
}

export function App(appProps: HydrationData) {
  const { pathname } = useLocation();
  const initialPathname = React.useRef(pathname);
  const pageNotFound = React.useMemo(
    () =>
      (appProps.pageNotFound || false) && initialPathname.current === pathname,
    [appProps.pageNotFound, pathname]
  );

  usePing();
  useGleanPage(pageNotFound, appProps.doc);
  useScrollDepthMeasurement();

  const localeMatch = useMatch("/:locale/*");

  useEffect(() => {
    const locale = localeMatch?.params.locale || appProps.locale;

    document.documentElement.setAttribute("lang", locale);
  }, [appProps.locale, localeMatch]);

  const isServer = useIsServer();

  // When preparing a build for use in the NPM package, WRITER_MODE is always true.
  // But if the App is loaded from the code that builds the SPAs, then `isServer`
  // is true. So you have to have `isServer && WRITER_MODE` at the same time.
  const homePage =
    !isServer && WRITER_MODE ? (
      <LazyStandardLayout>
        <WritersHomepage />
      </LazyStandardLayout>
    ) : (
      <PageOrPageNotFound pageNotFound={pageNotFound}>
        <StandardLayout>
          <Homepage {...appProps} />
        </StandardLayout>
      </PageOrPageNotFound>
    );

  const routes = (
    <Routes>
      {/*
        Note, this can only happen in local development.
        In production, all traffic at `/` is redirected to at least
        having a locale. So it'll be `/en-US/` (for example) by the
        time it hits any React code.
       */}
      <Route
        path="/"
        element={WRITER_MODE ? homePage : <Navigate to="/en-US/" />}
      />
      <Route
        path="/en-US/curriculum/*"
        element={
          <Layout pageType="curriculum">
            <Curriculum {...appProps} />
          </Layout>
        }
      />
      <Route
        path="/en-US/blog/*"
        element={
          <StandardLayout extraClasses="blog">
            <Blog {...appProps} />
          </StandardLayout>
        }
      />
      <Route
        path="/:locale/*"
        element={
          <Routes>
            {WRITER_MODE && (
              <>
                <Route
                  path="/_flaws"
                  element={
                    <LazyStandardLayout>
                      <AllFlaws />
                    </LazyStandardLayout>
                  }
                />
                <Route
                  path="/_translations/*"
                  element={
                    <LazyStandardLayout>
                      <Translations />
                    </LazyStandardLayout>
                  }
                />

                {/*
                This route exclusively exists for development on the <PageNotFound>
                component itself.
                Because it's impossible to trigger a 404 when using the React dev
                server, the one on localhost:3000, you can use this endpoint
                to simulate it.
                 */}
                <Route
                  path="/_404/*"
                  element={
                    <StandardLayout>
                      <PageNotFound />
                    </StandardLayout>
                  }
                />

                {/*
                This route exclusively exists for development on the <Homepage>
                component itself.
                Normally, you get to the home page by NOT being in WRITER_MODE, but
                if you want to use the hot-reloading app, it might be convenient
                to be able to run it locally
                 */}
                <Route
                  path="/_homepage/*"
                  element={
                    <StandardLayout>
                      <Homepage />
                    </StandardLayout>
                  }
                />

                <Route
                  path="/_sitemap/*"
                  element={
                    <LazyStandardLayout>
                      <Sitemap />
                    </LazyStandardLayout>
                  }
                />
              </>
            )}
            <Route path="/" element={homePage} />
            <Route
              path="/play"
              element={
                <LazyStandardLayout>
                  <Playground />
                </LazyStandardLayout>
              }
            />
            <Route
              path="observatory/*"
              element={
                <LazyStandardLayout pageType="observatory">
                  <Observatory {...appProps} />
                </LazyStandardLayout>
              }
            />
            <Route
              path="/search"
              element={
                <StandardLayout>
                  <SiteSearch />
                </StandardLayout>
              }
            />
            {PLUS_IS_ENABLED && (
              <Route
                path="/plus/*"
                element={
                  <StandardLayout extraClasses="plus">
                    <Plus {...appProps} />
                  </StandardLayout>
                }
              />
            )}
            {PLACEMENT_ENABLED && (
              <Route
                path="/advertising/*"
                element={
                  <StandardLayout>
                    <Advertising {...appProps} />
                  </StandardLayout>
                }
              />
            )}
            <Route
              path="/docs/*"
              element={
                <PageOrPageNotFound pageNotFound={pageNotFound}>
                  <DocumentLayout>
                    <Document {...appProps} />
                  </DocumentLayout>
                </PageOrPageNotFound>
              }
            />
            <Route
              path="/about/*"
              element={
                <StandardLayout>
                  <About />
                </StandardLayout>
              }
            />
            <Route
              path="/community/*"
              element={
                <StandardLayout>
                  <Community {...appProps} />
                </StandardLayout>
              }
            />
            <Route
              path="/community/spotlight/*"
              element={
                <StandardLayout>
                  <ContributorSpotlight {...appProps} />
                </StandardLayout>
              }
            />
            <Route
              path="/newsletter"
              element={
                <StandardLayout>
                  <Newsletter />
                </StandardLayout>
              }
            />
            <Route
              path="*"
              element={
                <StandardLayout>
                  <PageNotFound />
                </StandardLayout>
              }
            />
          </Routes>
        }
      />
    </Routes>
  );
  return routes;
}

function useScrollDepthMeasurement(thresholds = [25, 50, 75]) {
  const timeoutID = React.useRef<number | null>();
  const [currentDepth, setScrollDepth] = React.useState(0);
  const { gtag } = useGA();

  useEffect(() => {
    const listener = () => {
      if (timeoutID.current) {
        window.clearTimeout(timeoutID.current);
      }
      timeoutID.current = window.setTimeout(() => {
        const { scrollHeight } = document.documentElement;
        const { innerHeight, scrollY } = window;
        const scrollPosition = innerHeight + scrollY;
        const depth = (100 * scrollPosition) / scrollHeight;

        const matchingThresholds = thresholds.filter(
          (threshold) => currentDepth < threshold && threshold <= depth
        );

        matchingThresholds.forEach((threshold) => {
          gtag("event", "scroll", {
            percent_scrolled: String(threshold),
          });
        });

        const lastThreshold = matchingThresholds.at(-1);
        if (lastThreshold) {
          setScrollDepth(lastThreshold);
        }

        timeoutID.current = null;
      }, 100);
    };

    window.addEventListener("scroll", listener);

    return () => window.removeEventListener("scroll", listener);
  });

  return currentDepth;
}
