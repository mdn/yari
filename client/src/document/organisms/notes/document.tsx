import React from "react";
import useSWR, { mutate } from "swr";
import Modal from "react-modal";

import { Doc } from "../../types";

import "./document.scss";

interface Note {
  id: number;
  url: string;
  text: string;
  textRendered: string;
  created: string;
  modified: string;
}

interface NotesData {
  notes: Note[];
  count: number;
  csrfmiddlewaretoken: string;
}

Modal.setAppElement("main");

export default function DocumentApp({ doc }: { doc: Doc }) {
  const apiURL = `/api/v1/plus/notes/document/?${new URLSearchParams({
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
    console.log(response);

    // if (response.status === 400) {
    //   setValidationErrors((await response.json()) as ValidationErrors);
    // } else if (!response.ok) {
    //   setSendError(new Error(`${response.status} on ${response.url}`));
    // } else {
    //   setSent(true);
    //   refreshUserSettings();
    // }
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
            // onRefresh={() => {
            //   mutate(apiURL);
            // }}
            submitNote={async (text: string) => {
              await saveNote(text);
              mutate(apiURL);
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
  // onRefresh: () => void;
  submitNote: (text: string) => void;
};

function NotesModal({ notes, onRequestClose, submitNote }: NotesModalProps) {
  const [newNote, setNewNote] = React.useState("");
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
              <div key={note.id}>
                <blockquote>{note.textRendered}</blockquote>
                <small>Updated {note.modified}</small>
              </div>
            );
          })}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (newNote.trim()) {
                submitNote(newNote.trim());
              }
            }}
          >
            <textarea
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
            ></textarea>
            <button type="submit">Save</button>
          </form>
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
