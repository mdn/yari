import { useEffect, useRef } from "react";

import { AIDialogInner } from "./ai";
import "./dialog.scss";
import { useUIStatus } from "../ui-context";

export function SearchDialog() {
  const { isDialogOpen, setIsDialogOpen } = useUIStatus();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog instanceof HTMLDialogElement && dialog.open !== isDialogOpen) {
      if (isDialogOpen) {
        dialog.showModal();
        const closeHandler = () => setIsDialogOpen(false);
        dialog.addEventListener("close", closeHandler);
        return () => dialog.removeEventListener("close", closeHandler);
      } else {
        dialog.close();
      }
    }
  }, [isDialogOpen, setIsDialogOpen]);

  return (
    <dialog ref={ref} className="search-dialog">
      <AIDialogInner />
    </dialog>
  );
}
