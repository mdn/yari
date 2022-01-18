import { useLocale } from "../../hooks";
import { Link } from "react-router-dom";
import SignInLink from "../../ui/atoms/signin-link";

export function NotSignedIn() {
  return (
    <>
      <h2>You have not signed in</h2>
      <SignInLink />
    </>
  );
}

export function NotSubscriber() {
  return (
    <>
      <h2>You are signed in but not an active subscriber</h2>
      <SignInLink />
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
