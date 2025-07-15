import type BCD from "@mdn/browser-compat-data/types";

// Extended for the fields, beyond the bcd types, that are extra-added
// exclusively in Yari.
export interface SimpleSupportStatementExtended
  extends BCD.SimpleSupportStatement {
  // Known for some support statements where the browser *version* is known,
  // as opposed to just "true" and if the version release date is known.
  release_date?: string;
  // The version before the version_removed if the *version* removed is known,
  // as opposed to just "true". Otherwise the version_removed.
  version_last?: BCD.VersionValue;
}

export type SupportStatementExtended =
  | SimpleSupportStatementExtended
  | SimpleSupportStatementExtended[];
