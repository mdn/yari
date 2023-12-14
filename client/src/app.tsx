import React, { useEffect } from "react";
import { Routes, Route, useLocation, useMatch } from "react-router-dom";

// we include our base SASS here to ensure it is loaded
// and applied before any component specific style
import "./app.scss";

import { WRITER_MODE, PLACEMENT_ENABLED, PLUS_IS_ENABLED } from "./env";
import { Document } from "./document";
import { A11yNav } from "./ui/molecules/a11y-nav";
import { Footer } from "./ui/organisms/footer";
import { TopNavigation } from "./ui/organisms/top-navigation";
import { Plus } from "./plus";
import { getCategoryByPathname } from "./utils";
import { useIsServer, usePing } from "./hooks";

import { useGleanPage } from "./telemetry/glean-context";
import { MainContentContainer } from "./ui/atoms/page-content";
import { Loading } from "./ui/atoms/loading";
import { HydrationData } from "../../libs/types/hydration";
import PageNotFound from "./page-not-found";
import { TopPlacement } from "./ui/organisms/placement";

const About = React.lazy(() => import("./about"));
const Advertising = React.lazy(() => import("./advertising"));
const Blog = React.lazy(() => import("./blog"));
const Contribute = React.lazy(() => import("./community"));
const ContributorSpotlight = React.lazy(
  () => import("./contributor-spotlight")
);
const Homepage = React.lazy(() => import("./homepage"));
const Newsletter = React.lazy(() => import("./newsletter"));
const Playground = React.lazy(() => import("./playground"));
const SiteSearch = React.lazy(() => import("./site-search"));

const AllFlaws = React.lazy(() => import("./flaws"));
const Sitemap = React.lazy(() => import("./sitemap"));
const Translations = React.lazy(() => import("./translations"));
const WritersHomepage = React.lazy(() => import("./writers-homepage"));

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
        {pageType !== "document-page" && (
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
  extraClasses,
  children,
}: {
  extraClasses?: string;
  children: React.ReactNode;
}) {
  return (
    <Layout pageType={`standard-page ${extraClasses || ""}`}>{children}</Layout>
  );
}
function DocumentLayout({ children }) {
  return <Layout pageType="document-page">{children}</Layout>;
}

function PageOrPageNotFound({ pageNotFound, children }) {
  return pageNotFound ? (
    <LazyStandardLayout>
      <PageNotFound />
    </LazyStandardLayout>
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
        <LazyStandardLayout>
          <Homepage {...appProps} />
        </LazyStandardLayout>
      </PageOrPageNotFound>
    );

  const routes = (
    <Routes>
      {/*
        Note, this can only happen in local development.
        In production, all traffic at `/` is redirected to at least
        having a locale. So it'll be `/en-US` (for example) by the
        time it hits any React code.
       */}
      <Route path="/" element={homePage} />
      <Route
        path="/en-US/blog/*"
        element={
          <LazyStandardLayout extraClasses="blog">
            <Blog {...appProps} />
          </LazyStandardLayout>
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
                    <LazyStandardLayout>
                      <PageNotFound />
                    </LazyStandardLayout>
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
                    <LazyStandardLayout>
                      <Homepage />
                    </LazyStandardLayout>
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
              path="/search"
              element={
                <LazyStandardLayout>
                  <SiteSearch />
                </LazyStandardLayout>
              }
            />
            {PLUS_IS_ENABLED && (
              <Route
                path="/plus/*"
                element={
                  <LazyStandardLayout extraClasses="plus">
                    <Plus {...appProps} />
                  </LazyStandardLayout>
                }
              />
            )}
            {PLACEMENT_ENABLED && (
              <Route
                path="/advertising/*"
                element={
                  <LazyStandardLayout>
                    <Advertising {...appProps} />
                  </LazyStandardLayout>
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
                <LazyStandardLayout>
                  <About />
                </LazyStandardLayout>
              }
            />
            <Route
              path="/community/*"
              element={
                <LazyStandardLayout>
                  <Contribute />
                </LazyStandardLayout>
              }
            />
            <Route
              path="/community/spotlight/*"
              element={
                <LazyStandardLayout>
                  <ContributorSpotlight {...appProps} />
                </LazyStandardLayout>
              }
            />
            <Route
              path="/newsletter"
              element={
                <LazyStandardLayout>
                  <Newsletter />
                </LazyStandardLayout>
              }
            />
            <Route
              path="*"
              element={
                <LazyStandardLayout>
                  <PageNotFound />
                </LazyStandardLayout>
              }
            />
          </Routes>
        }
      />
    </Routes>
  );
  return routes;
}
