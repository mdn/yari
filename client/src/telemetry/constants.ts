import { ViewportBreakpoint } from "./glean-context";

export const OFFER_OVERVIEW_CLICK = "offer_overview_click";
export const SIDEBAR_CLICK = "sidebar_click";
export const SIDEBAR_CLICK_WITH_FILTER = "sidebar_click_with_filter";
export const SIDEBAR_FILTER_FOCUS = "sidebar_filter_focus";
export const SIDEBAR_FILTER_TYPED = "sidebar_filter_typed";
export const TOC_CLICK = "toc_click";
/** Replaced "top_nav_already_subscriber" in July 2023. */
export const TOP_NAV_LOGIN = "top_nav: login";
/** Replaced "top_nav_get_mdn_plus" in July 2023. */
export const TOP_NAV_SIGNUP = "top_nav: signup";
export const TOGGLE_PLUS_OFFLINE_DISABLED = "toggle_plus_offline_disabled";
export const TOGGLE_PLUS_OFFLINE_ENABLED = "toggle_plus_offline_enabled";
export const TOGGLE_PLUS_ADS_FREE_DISABLED = "toggle_plus_ads_free_disabled";
export const TOGGLE_PLUS_ADS_FREE_ENABLED = "toggle_plus_ads_free_enabled";
export const TOGGLE_PLUS_AI_HELP_HISTORY_DISABLED =
  "toggle_plus_ai_help_history_disabled";
export const TOGGLE_PLUS_AI_HELP_HISTORY_ENABLED =
  "toggle_plus_ai_help_history_enabled";
export const BANNER_BLOG_LAUNCH_CLICK = "banner_blog_launch_click";
export const AI_HELP = "ai_help";
export const BANNER_AI_HELP_CLICK = "banner_ai_help_click";
export const BANNER_SCRIMBA_CLICK = "banner_scrimba_click";
export const BANNER_SCRIMBA_VIEW = "banner_scrimba_view";
export const PLAYGROUND = "play_action";
export const AI_EXPLAIN = "ai_explain";
export const SETTINGS = "settings";
export const OBSERVATORY = "observatory";
export const CURRICULUM = "curriculum";
export const BCD_TABLE = "bcd";

export const A11Y_MENU = "a11y_menu";

export const MENU = Object.freeze({
  CLICK_LINK: "menu_click_link",
  CLICK_MENU: "menu_click_menu",
  CLICK_SUBMENU: "menu_click_submenu",
});

export const PLUS_COLLECTIONS = Object.freeze({
  ACTIONS_NOTE_ADD: "collections_actions_note_add",
  ACTIONS_NOTE_EDIT: "collections_actions_note_edit",
  ARTICLE_ACTIONS_SELECT_OPENED: "article_actions_collection_select_opened",
  ARTICLE_ACTIONS_NEW: "article_actions_new_collection",
  ARTICLE_ACTIONS_OPENED: "article_actions_collections_opened",
  BANNER_NEW: "collections_banner_new_collection",
  NEW_MODAL_SUBMIT_ARTICLE_ACTIONS:
    "new_collection_modal_submit_article_actions",
  NEW_MODAL_SUBMIT_COLLECTIONS_PAGE:
    "new_collection_modal_submit_collections_page",
  NEW_MODAL_UPGRADE_LINK: "new_collection_modal_upgrade_link",
});

export const PLUS_UPDATES = Object.freeze({
  EVENT_COLLAPSE: "plus_updates_event_collapse",
  EVENT_EXPAND: "plus_updates_event_expand",
  FILTER_CHANGE: "plus_updates_filter_change",
  MDN_PLUS: "plus_updates_mdn_plus",
  PAGE_CHANGE: "plus_updates_page_change",
});

export const BREADCRUMB_CLICK = "breadcrumb_click";

export const VIEWPORT_BREAKPOINTS: readonly [ViewportBreakpoint, number][] =
  Object.freeze([
    ["xxl", 1441],
    ["xl", 1200],
    ["lg", 992],
    ["md", 769],
    ["sm", 426],
    ["xs", 0],
  ]);

export const ARTICLE_FOOTER = "article_footer";
export const THUMBS = "thumbs";

export const BASELINE = Object.freeze({
  TOGGLE_OPEN: "baseline_toggle_open",
  LINK_LEARN_MORE: "baseline_link_learn_more",
  LINK_BCD_TABLE: "baseline_link_bcd_table",
  LINK_FEEDBACK: "baseline_link_feedback",
});

export const CLIENT_SIDE_NAVIGATION = "client_side_nav";
export const LANGUAGE = "language";
export const LANGUAGE_REMEMBER = "language_remember";
export const THEME_SWITCHER = "theme_switcher";
export const SURVEY = "survey";
export const HOMEPAGE_HERO = "homepage_hero";
export const HOMEPAGE = "homepage";
export const HOMEPAGE_ITEMS = Object.freeze({
  ARTICLE: "article",
  ARTICLE_TAG: "article_tag",
  NEWS: "news",
  NEWS_SOURCE: "news_source",
  CONTRIBUTION: "contribution",
  CONTRIBUTION_REPO: "contribution_repo",
});

export const EXTERNAL_LINK = "external-link";
