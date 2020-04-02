/**
 * KumaScript configuration options used by various other parts of the code.
 * Some of the values are  read from environment variables (which may be
 * set in the docker-compose.yml file in Kuma).
 *
 * @prettier
 */
const path = require('path');

module.exports = {
    port: parseInt(process.env['KUMASCRIPT_PORT']) || 9080,
    documentURLTemplate:
        process.env['DOCUMENT_URL_TEMPLATE'] ||
        'https://developer.mozilla.org/en-US/docs/{path}?raw=1&redirect=no',
    documentURL: process.env['DOCUMENT_URL'] || 'https://developer.mozilla.org',
    interactiveExamplesURL:
        process.env['INTERACTIVE_EXAMPLES_URL'] ||
        'https://interactive-examples.mdn.mozilla.net',
    liveSamplesURL:
        process.env['LIVE_SAMPLES_URL'] || 'https://mdn.mozillademos.org',

    // NOTE(djf): In January 2019 I tried rendering 9500 documents, and
    // it resulted in 14,600 items in the cache for a total size of 41mb
    // of content, so I think 80mb ought to be a good size for this.
    cacheMegabytes: parseInt(process.env['KUMASCRIPT_CACHE_MEGABYTES']) || 80,
    cacheMinutes: parseInt(process.env['KUMASCRIPT_CACHE_MINUTES']) || 60,

    // If this is configured, then src/cache.js will use Redis.
    // Otherwise it will fall back to an in-memory LRU cache.
    redisURL: process.env['REDIS_URL'],

    // This is hardcoded in our Kuma python code, so we're just hardcoding it
    // here as well without making it overridable via environment variable.
    envHeaderPrefix: 'x-kumascript-env-',

    // This is something that is configurable only for tests
    macrosDirectory: path.normalize(`${__dirname}/../macros/`),

    // Of course we want to log, except that sometimes we want to turn
    // it off for tests.
    logging: true
};
