import { useState, useRef } from "react";

import { ReactComponent as EnterFullscreen } from "../../public/assets/curriculum/enter-fullscreen.svg";

import "./scrim.scss";
import { CURRICULUM_PARTNER } from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";

export function ScrimIframe({
  url,
  children,
}: {
  url: string;
  children?: React.ReactNode;
}) {
  const [scrimLoaded, setScrimLoaded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const dialog = useRef<HTMLDialogElement | null>(null);

  const gleanClick = useGleanClick();

  return (
    <section className="scrim">
      <dialog ref={dialog} onCancel={() => setShowDialog(false)}>
        <div className="scrim-with-border">
          <div className="scrim-inner">
            <div className="partner-header">
              <span>Clicking will load content from scrimba.com</span>
              <button
                autoFocus
                tabIndex={0}
                onClick={() => {
                  if (showDialog) {
                    dialog.current?.close();
                    setShowDialog(false);
                    gleanClick(
                      `${CURRICULUM_PARTNER}: landing_page_scrim_exit_fullscreen`
                    );
                  } else {
                    setScrimLoaded(true);
                    dialog.current?.showModal();
                    setShowDialog(true);
                    gleanClick(
                      `${CURRICULUM_PARTNER}: landing_page_scrim_enter_fullscreen`
                    );
                  }
                }}
              >
                <div
                  className={`fullscreen-button ${showDialog ? "exit" : "enter"}`}
                >
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
            {scrimLoaded ? (
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
                    setScrimLoaded(true);
                    dialog.current?.showModal();
                    setShowDialog(true);
                    gleanClick(
                      `${CURRICULUM_PARTNER}: landing_page_scrim_loaded`
                    );
                  }}
                  className={`fullscreen-overlay ${showDialog ? "exit" : "enter"}`}
                >
                  <EnterFullscreen />
                  <span className="visually-hidden">
                    {showDialog
                      ? "Close dialog."
                      : "Load scrim and open dialog."}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
      {children}
    </section>
  );
}
