import React, { useEffect } from "react";
import { Routes, Route, useLocation, useMatch } from "react-router-dom";

// we include our base SASS here to ensure it is loaded
// and applied before any component specific style
import "./app.scss";

import { CRUD_MODE, PLUS_IS_ENABLED } from "./env";
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
import { Contribute } from "./community";
import { ContributorSpotlight } from "./contributor-spotlight";
import { useIsServer, usePing } from "./hooks";

import { Banner } from "./banners";
import { useGleanPage } from "./telemetry/glean-context";
import { MainContentContainer } from "./ui/atoms/page-content";
import { Loading } from "./ui/atoms/loading";

const AllFlaws = React.lazy(() => import("./flaws"));
const Translations = React.lazy(() => import("./translations"));
const WritersHomepage = React.lazy(() => import("./writers-homepage"));
const Sitemap = React.lazy(() => import("./sitemap"));

function Layout({ pageType, children }) {
  const { pathname } = useLocation();
  const [category, setCategory] = React.useState<string | null>(
    getCategoryByPathname(pathname)
  );

  const isServer = useIsServer();

  React.useEffect(() => {
    setCategory(getCategoryByPathname(pathname));
  }, [pathname]);

  return (
    <>
      <A11yNav />
      {!isServer && <Banner />}
      <div
        className={`page-wrapper  ${
          category ? `category-${category}` : ""
        } ${pageType}`}
      >
        {pageType !== "document-page" && <TopNavigation />}
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
  return (
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
    <StandardLayout>
      <PageNotFound />
    </StandardLayout>
  ) : (
    children
  );
}

export function App(appProps) {
  usePing();
  useGleanPage();
  const localeMatch = useMatch("/:locale/*");

  useEffect(() => {
    const locale = localeMatch?.params.locale || appProps.locale;

    document.documentElement.setAttribute("lang", locale);
  }, [appProps.locale, localeMatch]);

  const [pageNotFound, setPageNotFound] = React.useState<boolean>(
    appProps.pageNotFound
  );
  const { pathname } = useLocation();
  const initialPathname = React.useRef(pathname);

  React.useEffect(() => {
    setPageNotFound(
      appProps.pageNotFound && initialPathname.current === pathname
    );
  }, [appProps.pageNotFound, pathname]);

  const isServer = useIsServer();

  // When preparing a build for use in the NPM package, CRUD_MODE is always true.
  // But if the App is loaded from the code that builds the SPAs, then `isServer`
  // is true. So you have to have `isServer && CRUD_MODE` at the same time.
  const homePage =
    !isServer && CRUD_MODE ? (
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
        having a locale. So it'll be `/en-US` (for example) by the
        time it hits any React code.
       */}
      <Route path="/" element={homePage} />
      <Route
        path="/:locale/*"
        element={
          <Routes>
            {CRUD_MODE && (
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
                Normally, you get to the home page by NOT being in CRUD_MODE, but
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
                  <Contribute />
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
