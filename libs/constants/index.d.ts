export const ACTIVE_LOCALES: Set<string>;
export const VALID_LOCALES: Map<string, string>;
export const RETIRED_LOCALES: Map<string, string>;
export const DEFAULT_LOCALE: string;
export const LOCALE_ALIASES: Map<string, string>;
export const PREFERRED_LOCALE_COOKIE_NAME: string;
export const CSP_SCRIPT_SRC_VALUES: string[];
export const CSP_VALUE: string;
export const PLAYGROUND_UNSAFE_CSP_VALUE: string;
export const AUDIO_EXT: string[];
export const FONT_EXT: string[];
export const BINARY_IMAGE_EXT: string[];
export const ANY_IMAGE_EXT: string[];
export const VIDEO_EXT: string[];
export const ANY_ATTACHMENT_EXT: string[];
export const BINARY_ATTACHMENT_EXT: string[];
export const createRegExpFromExtensions: (...extensions: string[]) => RegExp;
export const ANY_ATTACHMENT_REGEXP: RegExp;
export const BINARY_ATTACHMENT_REGEXP: RegExp;
export const FLAW_LEVELS: Readonly<Record<string, string>>;
export const VALID_FLAW_CHECKS: Set<string>;
export const MDN_PLUS_TITLE: string;
export const CURRICULUM_TITLE: string;
export const HTML_FILENAME: string;
export const MARKDOWN_FILENAME: string;
export const VALID_MIME_TYPES: Set<string>;
export const MAX_COMPRESSION_DIFFERENCE_PERCENTAGE: number;
export const OBSERVATORY_TITLE: string;
export const OBSERVATORY_TITLE_FULL: string;
