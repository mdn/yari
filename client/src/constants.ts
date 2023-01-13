// Constants that are used outside of the client.
export { MDN_PLUS_TITLE, VALID_LOCALES } from "../../libs/constants";

// Constants that are NOT used outside of the client.
export const HEADER_NOTIFICATIONS_MENU_API_URL =
  "/api/v1/plus/notifications/?limit=1&unread=true";

export enum FeatureId {
  PLUS_UPDATES_V2 = "plus_updates_v2",
  PLUS_NEWSLETTER = "plus_newsletter",
}
