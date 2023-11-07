import LogInLink from "../../ui/atoms/login-link";
import NoteCard from "../../ui/molecules/notecards";
import { getCategoryByPathname } from "../../utils";

export function NotSignedIn() {
  return (
    <div className="container">
      <h3>You have not signed in</h3>
      <LogInLink />
    </div>
  );
}

export function NotSubscriber() {
  return (
    <>
      <h2>You are signed in but not an active subscriber</h2>
      <LogInLink />
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

export function _getIconLabel(url: string) {
  const category = getCategoryByPathname(url);

  if (!category) {
    return "docs";
  }

  if (category === "javascript") {
    return "js";
  }

  if (category === "accessibility") {
    return "acc";
  }

  return category;
}
