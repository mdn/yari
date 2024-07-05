import { useState, useRef } from "react";

import { ReactComponent as EnterFullscreen } from "../../public/assets/curriculum/enter-fullscreen.svg";

import "./scrim.scss";

export function PartnerIframe({
  url,
  children,
}: {
  url: string;
  children?: React.ReactNode;
}) {
  const [scrimmed, setScrimmed] = useState(false);
  const [show, setShow] = useState(false);
  const dialog = useRef<HTMLDialogElement | null>(null);

  return (
    <div className="scrim">
      <dialog ref={dialog} onCancel={() => setShow(false)}>
        <div className="scrim-with-border">
          <div className="scrim-inner">
            <div className="partner-header">
              <span>Clicking will load content from scrimba.com</span>
              <button
                autoFocus
                tabIndex={0}
                onClick={() => {
                  if (show) {
                    dialog.current?.close();
                    setShow(false);
                  } else {
                    setScrimmed(true);
                    dialog.current?.showModal();
                    setShow(true);
                  }
                }}
              >
                <div className={`fullscreen-button ${show ? "exit" : "enter"}`}>
                  <span className="visually-hidden">Toggle fullscreen</span>
                </div>
              </button>
              <a
                href={url}
                target="_blank"
                rel="origin noreferrer"
                className="external"
              >
                <span className="visually-hidden">Open on scrimba</span>
              </a>
            </div>
            {scrimmed ? (
              <iframe
                src={url}
                title="MDN + Scrimba partnership announcement scrim"
              ></iframe>
            ) : (
              <>
                <img
                  alt="MDN + Scrimba partnership announcement scrim preview"
                  src="/assets/curriculum/scrim.png"
                ></img>
                <button
                  onClick={() => {
                    setScrimmed(true);
                    dialog.current?.showModal();
                    setShow(true);
                  }}
                  className={`fullscreen-overlay ${show ? "exit" : "enter"}`}
                >
                  <EnterFullscreen />
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
      {children}
    </div>
  );
}
