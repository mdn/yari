export const DISABLE_AUTH = JSON.parse(
  process.env.REACT_APP_DISABLE_AUTH || "false"
);

export const CRUD_MODE = JSON.parse(
  process.env.REACT_APP_CRUD_MODE ||
    JSON.stringify(process.env.NODE_ENV === "development")
);

export const AUTOCOMPLETE_SEARCH_WIDGET = JSON.parse(
  process.env.REACT_APP_AUTOCOMPLETE_SEARCH_WIDGET || JSON.stringify(CRUD_MODE)
);

export const DEBUG_GOOGLE_ANALYTICS = JSON.parse(
  process.env.REACT_APP_DEBUG_GOOGLE_ANALYTICS || "false"
);
