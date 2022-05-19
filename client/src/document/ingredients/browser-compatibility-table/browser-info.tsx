// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { useContext } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '@mdn/browser-compat-data/types... Remove this comment to see the full error message
import type bcd from "@mdn/browser-compat-data/types";

export const BrowserInfoContext = React.createContext<bcd.Browsers | null>(
  null
);

export function BrowserName({ id }: { id: bcd.BrowserNames }) {
  const browserInfo = useContext(BrowserInfoContext);
  if (!browserInfo) {
    throw new Error("Missing browser info");
  }
  return <>{browserInfo[id].name}</>;
}
