import SignInLink from "../../ui/atoms/signin-link";
import NoteCard from "../../ui/molecules/notecards";

export function NotSignedIn() {
  return (
    <div className="container">
      <h3>You have not signed in</h3>
      <SignInLink />
    </div>
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
    <NoteCard type="negative">
      <h3>Server error</h3>
      <p>A server error occurred trying to get your bookmarks.</p>
      <p>
        <code>{error.toString()}</code>
      </p>
      <a href={window.location.pathname}>Reload this page and try again.</a>
    </NoteCard>
  );
}
