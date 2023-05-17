import { useEffect, useRef } from "react";

import { AIDialogInner } from "./ai";
import "./dialog.scss";

export function SearchDialog() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog instanceof HTMLDialogElement && !dialog.open) {
      dialog.showModal();
    }
  }, [ref]);

  return (
    <dialog ref={ref} className="search-dialog">
      <AIDialogInner />
    </dialog>
  );
}
