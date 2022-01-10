import useSWR from "swr";
import { useEffect } from "react";
import { Loading } from "../../ui/atoms/loading";
import { useUserData } from "../../user-context";
import { DataError, NotSignedIn, NotSubscriber } from ".";
import {
  createSearchParams,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { DISABLE_AUTH } from "../../constants";
import { AuthDisabled } from "../../ui/atoms/auth-disabled";
import { useCSRFMiddlewareToken } from "../../hooks";

export default function List({
  apiUrl,
  component,
}: {
  apiUrl: string;
  component: any;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const userData = useUserData();
  const csrfToken = useCSRFMiddlewareToken();
  const pageTitle = "My Watched Pages";

  const isSubscriber = userData && userData.isSubscriber;
  let localApiURL: string | null = null;
  if (isSubscriber) {
    const params = searchParams.toString();
    if (params) {
      const joiner = apiUrl.includes("?") ? "&" : "?";
      localApiURL = `${apiUrl}${joiner}${searchParams.toString()}`;
    } else {
      localApiURL = apiUrl;
    }
  }

  const { data, error, mutate } = useSWR(
    localApiURL,
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
  }, [data]);

  useEffect(() => {
    if (data) {
      // If you're on ?page=3 and the per_page number is 10 and you have
      // 31 bookmarks. If you delete the only bookmark there on page 3,
      // it no longer makes sense to be on that page. So we force a
      // change to `?page={3 - 1}`.
      if (data.metadata.page > 1 && data.items.length === 0) {
        const newSearchParams = createSearchParams(searchParams);
        if (data.metadata.page === 2) {
          newSearchParams.delete("page");
        } else {
          newSearchParams.set("page", `${data.metadata.page - 1}`);
        }
        setSearchParams(newSearchParams);
      }
    }
  }, [data, setSearchParams, searchParams]);

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

  if (error) {
    return <DataError error={error} />;
  } else if (!data) {
    return <Loading message="Waiting for data" />;
  }

  const maxPage = Math.ceil(data.metadata.total / data.metadata.per_page);
  const nextPage =
    data.metadata.page + 1 <= maxPage ? data.metadata.page + 1 : 0;
  const previousPage = data.metadata.page - 1 > 0 ? data.metadata.page - 1 : 0;

  function getPaginationURL(page: number) {
    const sp = createSearchParams(searchParams);
    if (page === 1) {
      sp.delete("page");
    } else {
      sp.set("page", `${page}`);
    }
    if (sp.toString()) {
      return `${pathname}?${sp.toString()}`;
    }
    return pathname;
  }

  return (
    <>
      {data?.items.map((item) =>
        component(item, { changedCallback: mutate, csrfToken: csrfToken || "" })
      )}
      {(nextPage !== 0 || previousPage !== 0) && (
        <div className="pagination">
          {nextPage !== 0 && (
            <Link to={getPaginationURL(nextPage)}>Load More</Link>
          )}
        </div>
      )}
    </>
  );
}
