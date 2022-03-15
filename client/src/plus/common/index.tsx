import SignInLink from "../../ui/atoms/signin-link";
import NoteCard from "../../ui/molecules/notecards";
import { docCategory } from "../../utils";

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
      <p>A server error occurred trying to get your collections.</p>
      <p>
        <code>{error.toString()}</code>
      </p>
      <a href={window.location.pathname}>Reload this page and try again.</a>
    </NoteCard>
  );
}

export function _getIconLabel(url) {
  let category = docCategory({ pathname: url });

  if (category) {
    category = category?.split("-")[1];

    if (category === "javascript") {
      return "js";
    }

    if (category === "accessibility") {
      return "acc";
    }
    return category;
  }

  return "docs";
}
