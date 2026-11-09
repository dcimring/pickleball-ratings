/**
 * Site-wide configuration — single source of truth for values that were
 * previously hardcoded across pages and components.
 */

export const SITE_URL = 'https://caymandink.com';
export const SITE_NAME = 'CAYMANDINK';

/**
 * Slugs of players who asked to have their profile removed (via /remove).
 * Listed slugs return 404 and are left out of the sitemap.
 */
export const HIDDEN_PLAYER_SLUGS: readonly string[] = [];

/** Locale used for date formatting throughout the app */
export const LOCALE = 'en-KY';

/** Community WhatsApp group invite */
export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Ct260BAJJ2xGslKvhlR6wJ?mode=hq1tcli';

/** Subtle texture overlaid on hero headers */
export const HERO_TEXTURE_URL = 'https://www.transparenttextures.com/patterns/cubes.png';
