// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { useEffect } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { Routes, Route, useLocation, useMatch } from "react-router-dom";

// we include our base SASS here to ensure it is loaded
// and applied before any component specific style
import "./app.scss";

import { CRUD_MODE, PLUS_IS_ENABLED } from "./constants";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './homepage'. Did you mean to s... Remove this comment to see the full error message
import { Homepage } from "./homepage";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './document'. Did you mean to s... Remove this comment to see the full error message
import { Document } from "./document";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './ui/molecules/a11y-nav'. Did ... Remove this comment to see the full error message
import { A11yNav } from "./ui/molecules/a11y-nav";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './ui/organisms/footer'. Did yo... Remove this comment to see the full error message
import { Footer } from "./ui/organisms/footer";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './ui/organisms/top-navigation'... Remove this comment to see the full error message
import { TopNavigation } from "./ui/organisms/top-navigation";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './site-search'. Did you mean t... Remove this comment to see the full error message
import { SiteSearch } from "./site-search";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './ui/atoms/loading'. Did you m... Remove this comment to see the full error message
import { Loading } from "./ui/atoms/loading";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './ui/atoms/page-content'. Did ... Remove this comment to see the full error message
import { PageContentContainer } from "./ui/atoms/page-content";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './page-not-found'. Did you mea... Remove this comment to see the full error message
import { PageNotFound } from "./page-not-found";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './plus'. Did you mean to set t... Remove this comment to see the full error message
import { Plus } from "./plus";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './about'. Did you mean to set ... Remove this comment to see the full error message
import { About } from "./about";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './offline-settings'. Did you m... Remove this comment to see the full error message
import { OfflineSettings } from "./offline-settings";
import { docCategory } from "./utils";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './community'. Did you mean to ... Remove this comment to see the full error message
import { Contribute } from "./community";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './contributor-spotlight'. Did ... Remove this comment to see the full error message
import { ContributorSpotlight } from "./contributor-spotlight";
import { useIsServer } from "./hooks";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './banners'. Did you mean to se... Remove this comment to see the full error message
import { Banner, hasActiveBanners } from "./banners";

// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const AllFlaws = React.lazy(() => import("./flaws"));
// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const Translations = React.lazy(() => import("./translations"));
// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const WritersHomepage = React.lazy(() => import("./writers-homepage"));
// @ts-expect-error ts-migrate(1323) FIXME: Dynamic imports are only supported when the '--mod... Remove this comment to see the full error message
const Sitemap = React.lazy(() => import("./sitemap"));

function Layout({ pageType, children }) {
  const { pathname } = useLocation();
  const [category, setCategory] = React.useState<string | null>(
    docCategory({ pathname })
  );

  const isServer = useIsServer();

  React.useEffect(() => {
    setCategory(docCategory({ pathname }));
  }, [pathname]);

  return (
    <>
      <A11yNav />
      {!isServer && hasActiveBanners && <Banner />}
      <div className={`page-wrapper  ${category || ""} ${pageType}`}>
        {pageType !== "document-page" && <TopNavigation />}
        {children}
      </div>
      <Footer />
    </>
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

/** This component exists so you can dynamically change which sub-component to
 * render depending on the conditions. In particular, we need to be able to
 * render the <PageNotFound> component, in server-side rendering, if told to do
 * so. But if the client then changes the location (by clicking a <Link>
 * or a react-router navigate() call) we need to ignore the fact that it was
 * originally not found. Perhaps, this new location that the client is
 * requesting is going to work.
 */
function PageOrPageNotFound({ pageNotFound, children }) {
  // It's true by default if the SSR rendering says so.
  const [notFound, setNotFound] = React.useState<boolean>(!!pageNotFound);
  const { pathname } = useLocation();
  const initialPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (initialPathname.current && initialPathname.current !== pathname) {
      setNotFound(false);
    }
  }, [pathname]);

  return notFound ? (
    <StandardLayout>
      <PageNotFound />
    </StandardLayout>
  ) : (
    children
  );
}

function LoadingFallback({ message }: { message?: string }) {
  return (
    <StandardLayout>
      <PageContentContainer>
        {/* This extra minHeight is just so that the footer doesn't flicker
          in and out as the fallback appears. */}
        <Loading minHeight={800} message={message || "Loading…"} />
      </PageContentContainer>
    </StandardLayout>
  );
}

export function App(appProps) {
  const localeMatch = useMatch("/:locale/*");

  useEffect(() => {
    const locale = localeMatch?.params.locale || appProps.locale;

    document.documentElement.setAttribute("lang", locale);
  }, [appProps.locale, localeMatch]);

  const isServer = useIsServer();

  // When preparing a build for use in the NPM package, CRUD_MODE is always true.
  // But if the App is loaded from the code that builds the SPAs, then `isServer`
  // is true. So you have to have `isServer && CRUD_MODE` at the same time.
  const homePage =
    !isServer && CRUD_MODE ? (
      <Layout pageType="standard-page">
        <WritersHomepage />
      </Layout>
    ) : (
      <PageOrPageNotFound pageNotFound={appProps.pageNotFound}>
        <Layout pageType="standard-page">
          <Homepage {...appProps} />
        </Layout>
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
                    <StandardLayout>
                      <AllFlaws />
                    </StandardLayout>
                  }
                />
                <Route
                  path="/_translations/*"
                  element={
                    <StandardLayout>
                      <Translations />
                    </StandardLayout>
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
                    <StandardLayout>
                      <Sitemap />
                    </StandardLayout>
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
            {PLUS_IS_ENABLED && (
              <Route
                path="/offline-settings"
                element={
                  <StandardLayout>
                    <OfflineSettings {...appProps} />
                  </StandardLayout>
                }
              />
            )}
            <Route
              path="/docs/*"
              element={
                <PageOrPageNotFound pageNotFound={appProps.pageNotFound}>
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
  /* This might look a bit odd but it's actually quite handy.
   * This way, when rendering client-side, we wrap all the routes in
   * <React.Suspense> but in server-side rendering that goes away.
   */
  return isServer ? (
    routes
  ) : (
    <React.Suspense fallback={<LoadingFallback />}>{routes}</React.Suspense>
  );
}
