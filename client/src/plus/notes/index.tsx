import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";

import { Loading } from "../../ui/atoms/loading";
import { useUserData } from "../../user-context";
import { useLocale } from "../../hooks";
import "./index.scss";

interface Note {
  id: number;
  url: string;
  title: string;
  modified: string;
  text: string;
  textHTML: string;
}

interface NotesData {
  notes: Note[];
  count: number;
}

export default function Notes() {
  const userData = useUserData();

  const pageTitle = "Your notes";
  React.useEffect(() => {
    document.title = pageTitle;
  }, []);

  const { data, error } = useSWR<NotesData | null, Error | null>(
    userData && userData.isAuthenticated && userData.isSubscriber
      ? "/api/v1/plus/notes/"
      : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      const data = (await response.json()) as NotesData;
      return data;
    }
  );

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
  return <DisplayData data={data} />;
}

function DisplayData({ data }: { data: NotesData }) {
  return (
    <section>
      <h3>Your notes ({data.count.toLocaleString()})</h3>
      {data.notes.map((note) => {
        return (
          <div key={note.id}>
            <h4>
              On <a href={note.url}>{note.title}</a>
            </h4>
            <p dangerouslySetInnerHTML={{ __html: note.textHTML }}></p>
            <p>
              <small>{note.modified}</small> - delete?
            </p>
          </div>
        );
      })}
    </section>
  );
}

function DataError({ error }: { error: Error }) {
  return (
    <div className="notecard negative">
      <h3>Server error</h3>
      <p>A server error occurred trying to get your notes.</p>
      <p>
        <code>{error.toString()}</code>
      </p>
      <a href={window.location.pathname}>Reload this page and try again.</a>
    </div>
  );
}

function NotSignedIn() {
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

function NotSubscriber() {
  const locale = useLocale();
  return (
    <>
      <h2>You are signed in but not an active subscriber</h2>
      <Link to={`/${locale}/plus`}>Go to the MDN Plus home page</Link>
    </>
  );
}
