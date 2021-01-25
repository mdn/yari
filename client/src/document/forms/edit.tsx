import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import Modal from "react-modal";

import { Document } from "../index";
import { useDocumentURL } from "../hooks";
import { DocumentForm, DocumentOutData } from "./form";

import "./edit.scss";
import "./modal.scss";

Modal.setAppElement("#root");

export default function DocumentEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const documentURL = useDocumentURL();
  const fetchURL = `/_document?${new URLSearchParams({
    url: documentURL,
  }).toString()}`;
  const { data, error } = useSWR(fetchURL, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} on ${url}`);
    }
    return await response.json();
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState<Error | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  async function handleSave(data: DocumentOutData) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/_document?url=${encodeURIComponent(documentURL)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        setSavingError(new Error(`${response.status} on ${response.url}`));
        return;
      }
      setUpdated(new Date());
    } catch (err) {
      setSavingError(err);
    } finally {
      setIsSaving(false);
    }
  }

  // return (
  //   <main className="page-content-container document-edit" role="main">
  //     <Modal isOpen={true} overlayClassName="modal" className="edit-modal">
  //       <header>
  //         <h2 id="modal-main-heading">Quick-edit</h2>
  //       </header>

  //       <button
  //         id="close-modal"
  //         className="close-modal"
  //         onClick={() => {
  //           navigate(documentURL);
  //         }}
  //       >
  //         <span>Close modal</span>
  //       </button>

  //       {!data && !error && <p>Loading source data...</p>}
  //       {error && (
  //         <div className="attention">
  //           <h3>Error loading source</h3>
  //           <code>{error.toString()}</code>
  //         </div>
  //       )}

  //       <div className="document-edit-forms">
  //         {data && (
  //           <DocumentForm
  //             doc={data}
  //             {...{ isSaving, savingError }}
  //             onSave={handleSave}
  //           />
  //         )}
  //       </div>

  //       <button
  //         id="close-modal"
  //         className="close-modal"
  //         onClick={() => {
  //           navigate(documentURL);
  //         }}
  //       >
  //         <span>Close modal</span>
  //       </button>
  //     </Modal>
  //     <div className="documexxxnt-preview">
  //       <Document isPreview={true} updated={updated} />
  //     </div>
  //   </main>
  // );
  return (
    <>
      <Modal isOpen={true} overlayClassName="modal" className="edit-modal">
        <header>
          <h2 id="modal-main-heading">Quick-edit</h2>
        </header>

        <button
          id="close-modal"
          className="close-modal"
          onClick={() => {
            navigate(documentURL);
          }}
        >
          <span>Close modal</span>
        </button>

        {!data && !error && <p>Loading source data...</p>}
        {error && (
          <div className="attention">
            <h3>Error loading source</h3>
            <code>{error.toString()}</code>
          </div>
        )}

        <div className="document-edit-forms">
          {data && (
            <DocumentForm
              doc={data}
              {...{ isSaving, savingError }}
              onSave={handleSave}
            />
          )}
        </div>

        <button
          id="close-modal"
          className="close-modal"
          onClick={() => {
            navigate(documentURL);
          }}
        >
          <span>Close modal</span>
        </button>
      </Modal>

      <Document isPreview={true} updated={updated} />
    </>
  );
}
