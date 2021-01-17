export const DISABLE_AUTH = !!process.env.REACT_APP_DISABLE_AUTH;
export const CRUD_MODE = !!(
  process.env.REACT_APP_CRUD_MODE || process.env.NODE_ENV === "development"
);

export const AUTOCOMPLETE_SEARCH_WIDGET = !!(
  process.env.REACT_APP_AUTOCOMPLETE_SEARCH_WIDGET || CRUD_MODE
);

export const DEBUG_GOOGLE_ANALYTICS = !!process.env
  .REACT_APP_DEBUG_GOOGLE_ANALYTICS;
