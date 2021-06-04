import React from "react";
import { useUserData } from "../../../user-context";
import { Doc } from "../../types";

const DocumentApp = React.lazy(() => import("./document"));

export function NotesToggle({ doc }: { doc: Doc }) {
  const userData = useUserData();
  const isServer = typeof window === "undefined";
  if (isServer || !userData || (userData && !userData.isSubscriber)) {
    return null;
  }
  return (
    <React.Suspense fallback={<small>loading</small>}>
      <DocumentApp doc={doc} />
    </React.Suspense>
  );
}
