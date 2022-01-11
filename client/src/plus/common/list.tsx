import useSWR from "swr";
import { useEffect, useState } from "react";
import { Loading } from "../../ui/atoms/loading";
import { useUserData } from "../../user-context";
import { DataError, NotSignedIn, NotSubscriber } from ".";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { DISABLE_AUTH } from "../../constants";
import { AuthDisabled } from "../../ui/atoms/auth-disabled";
import { useCSRFMiddlewareToken } from "../../hooks";

export default function List({
  apiUrl,
  component,
  makeKey,
  pageTitle,
}: {
  apiUrl: string;
  component: any;
  makeKey: CallableFunction;
  pageTitle: string;
}) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchParams] = useSearchParams();
  const userData = useUserData();
  const csrfToken = useCSRFMiddlewareToken();

  if (DISABLE_AUTH) {
    return <AuthDisabled />;
  }

  if (!userData) {
    return <Loading message="Waiting for authentication" />;
  } else if (!userData.isAuthenticated) {
    return <NotSignedIn />;
  } else if (!userData.isSubscriber) {
    return <NotSubscriber />;
  }

  function getPageUrl(page: number) {
    let sp: URLSearchParams | string = createSearchParams(searchParams);
    const joiner = apiUrl.includes("?") ? "&" : "?";
    if (page === 1) {
      sp.delete("page");
    } else {
      sp.set("page", `${page}`);
    }
    if (sp.toString()) {
      sp = `${sp.toString()}`;
    }
    return `${apiUrl}${joiner}${sp}`;
  }

  const pages: JSX.Element[] = [];
  for (let i = 0; i < currentPage; i++) {
    pages.push(
      <Page
        fetchUrl={getPageUrl(i + 1)}
        key={i}
        makeKey={makeKey}
        csrfToken={csrfToken}
        ItemComponent={component}
        getNextPageHandler={() => setCurrentPage((page) => page + 1)}
        isLastLoadedPage={currentPage === i + 1}
        pageTitle={pageTitle}
      />
    );
  }

  return <>{pages}</>;
}

function Page({
  fetchUrl,
  makeKey,
  csrfToken,
  ItemComponent,
  getNextPageHandler,
  isLastLoadedPage,
  pageTitle,
}) {
  const { data, error, mutate } = useSWR(
    fetchUrl,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (data && data.metadata.total > 0) {
      let newTitle = `${pageTitle} (${data.metadata.total})`;
      if (data.metadata.page > 1) {
        newTitle += ` Page ${data.metadata.page}`;
      }
      document.title = newTitle;
    }
  }, [data, pageTitle]);

  if (error) {
    return <DataError error={error} />;
  } else if (!data || !data.items) {
    return <Loading message="Waiting for data" />;
  }

  const maxPage = Math.ceil(data.metadata.total / data.metadata.per_page);
  const nextPage =
    data.metadata.page + 1 <= maxPage ? data.metadata.page + 1 : 0;

  return (
    <>
      {data.items.map((item) => (
        <ItemComponent
          key={makeKey(item)}
          item={item}
          changedCallback={mutate}
          csrfToken={csrfToken || ""}
        />
      ))}
      {nextPage && isLastLoadedPage ? (
        <button onClick={getNextPageHandler}>Load more</button>
      ) : null}
    </>
  );
}
