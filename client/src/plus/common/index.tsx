import { useLocale } from "../../hooks";
import { Link } from "react-router-dom";

export function NotSignedIn() {
  const locale = useLocale();
  const sp = new URLSearchParams();
  sp.set("next", window.location.pathname);

  return (
    <>
      <h2>You have not signed in</h2>
      <Link to={`/${locale}/signin?${sp.toString()}`}>
        Please sign in to continue
      </Link>
    </>
  );
}

export function NotSubscriber() {
  const locale = useLocale();
  return (
    <>
      <h2>You are signed in but not an active subscriber</h2>
      <Link to={`/${locale}/plus`}>Go to the MDN Plus home page</Link>
    </>
  );
}

export function DataError({ error }: { error: Error }) {
  return (
    <div className="notecard negative">
      <h3>Server error</h3>
      <p>A server error occurred trying to get your bookmarks.</p>
      <p>
        <code>{error.toString()}</code>
      </p>
      <a href={window.location.pathname}>Reload this page and try again.</a>
    </div>
  );
}
