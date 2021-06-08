import React from "react";
import useSWR, { mutate } from "swr";
import Modal from "react-modal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Doc } from "../../types";

import "./document.scss";

dayjs.extend(relativeTime);

interface Note {
  id: number;
  url: string;
  text: string;
  textHTML: string;
  created: string;
  modified: string;
}

interface NotesData {
  notes: Note[];
  count: number;
  csrfmiddlewaretoken: string;
}

Modal.setAppElement("main");

const API_BASE = "/api/v1/plus/notes/";

export default function DocumentApp({ doc }: { doc: Doc }) {
  const apiURL = `${API_BASE}document/?${new URLSearchParams({
    url: doc.mdn_url,
  }).toString()}`;
  const { data, error } = useSWR<NotesData>(
    apiURL,
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

  const [open, toggleOpen] = React.useState(false);

  async function saveNote(text: string, id?: number) {
    if (!data) {
      return;
    }
    const formData = new URLSearchParams();
    formData.set("text", text);
    if (id) {
      formData.set("id", `${id}`);
    }

    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
  }

  async function deleteNote(note: Note) {
    if (!data) {
      return;
    }

    const response = await fetch(`${API_BASE}note/${note.id}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
  }

  async function updateNote(note: Note, text: string) {
    if (!data) {
      return;
    }
    const formData = new URLSearchParams();
    formData.set("text", text);

    const response = await fetch(`${API_BASE}note/${note.id}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": data.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${response.url}`);
    }
  }

  if (error) {
    return (
      <Container>
        <button>Notes: Error!</button>
      </Container>
    );
  }
  if (data) {
    return (
      <Container>
        <button
          onClick={() => {
            toggleOpen((v) => !v);
          }}
        >
          Notes: {data.count}
        </button>
        {open && (
          <NotesModal
            notes={data}
            onRequestClose={() => {
              toggleOpen(false);
            }}
            submitNote={async (text: string) => {
              await saveNote(text);
              mutate(apiURL);
              return true;
            }}
            deleteNote={async (note: Note) => {
              await deleteNote(note);
              mutate(apiURL);
              return true;
            }}
            updateNote={async (note: Note, text: string) => {
              await updateNote(note, text);
              mutate(apiURL);
              return true;
            }}
          />
        )}
      </Container>
    );
  }
  return (
    <Container>
      <button>Notes: ?</button>
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="plus-document-notes">{children}</div>;
}

type NotesModalProps = {
  notes: NotesData;
  onRequestClose: () => void;
  submitNote: (text: string) => Promise<boolean>;
  deleteNote: (note: Note) => Promise<boolean>;
  updateNote: (note: Note, text: string) => Promise<boolean>;
};

function NotesModal({
  notes,
  onRequestClose,
  submitNote,
  deleteNote,
  updateNote,
}: NotesModalProps) {
  const [deletedNote, setDeletedNote] = React.useState<Note | null>(null);

  return (
    <Modal
      overlayClassName="modal"
      className="modal-inner"
      aria-expanded
      onRequestClose={onRequestClose}
      isOpen
      parentSelector={() => document.querySelector("main")!}
    >
      <div className="modal-inner">
        <div className="modal-content">
          <h3>Notes ({notes.count})</h3>
          {notes.notes.map((note) => {
            return (
              <DisplayNote
                key={note.id}
                note={note}
                deleteNote={async () => {
                  await deleteNote(note);
                  setDeletedNote(note);
                  return true;
                }}
                updateNote={async (note: Note, text: string) => {
                  await updateNote(note, text);
                  return true;
                }}
              />
            );
          })}
          <NewNoteForm submitNote={submitNote} />
          {deletedNote && (
            <p>
              <button
                type="button"
                title={`Undo deletion of "${deletedNote.text.slice(0, 50)}"`}
                onClick={async () => {
                  await submitNote(deletedNote.text);
                  setDeletedNote(null);
                }}
              >
                Undo delete
              </button>
            </p>
          )}
        </div>
        <button
          type="button"
          className="close"
          onClick={() => {
            onRequestClose();
          }}
          aria-label="Close notes"
        >
          ✖
        </button>
        <figure className="mandala" aria-hidden="true" />
      </div>
    </Modal>
  );
}

function DisplayNote({
  note,
  deleteNote,
  updateNote,
}: {
  note: Note;
  deleteNote: (note: Note) => Promise<boolean>;
  updateNote: (note: Note, text: string) => Promise<boolean>;
}) {
  const [editMode, toggleEditMode] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");

  React.useEffect(() => {
    if (editMode) {
      setNewNote(note.text);
    }
  }, [editMode, note]);
  const created = dayjs(note.created);
  const modified = dayjs(note.modified);
  return (
    <div className="note">
      {editMode ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (newNote.trim()) {
              await updateNote(note, newNote.trim());
              toggleEditMode(false);
            }
          }}
        >
          <textarea
            value={newNote}
            onChange={(event) => setNewNote(event.target.value)}
          />
          <br />
          <button type="submit">Update</button>{" "}
          <button
            type="button"
            onClick={() => {
              toggleEditMode(false);
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <blockquote
          onClick={() => {
            toggleEditMode(true);
          }}
          dangerouslySetInnerHTML={{ __html: note.textHTML }}
        ></blockquote>
      )}

      <small>
        {created.isSame(modified, "second") ? "Created" : "Updated"}{" "}
        {modified.fromNow()}{" "}
        <button
          title="Delete note"
          onClick={async () => {
            await deleteNote(note);
          }}
        >
          🗑
        </button>
      </small>
    </div>
  );
}

function NewNoteForm({
  submitNote,
}: {
  submitNote: (text: string) => Promise<boolean>;
}) {
  const [newNote, setNewNote] = React.useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (newNote.trim()) {
          await submitNote(newNote.trim());
          setNewNote("");
        }
      }}
    >
      <textarea
        value={newNote}
        onChange={(event) => setNewNote(event.target.value)}
      ></textarea>
      <button type="submit">Save</button>
    </form>
  );
}
