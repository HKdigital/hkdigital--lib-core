/**
 * @typedef {Object} RobotsConfig
 * @property {string[] | '*'} [allowedHosts]
 *   Allowed host patterns. Use '*' or omit to allow all hosts.
 *   Supports wildcards (e.g., '*.example.com')
 * @property {string[]} [disallowedPaths]
 *   Paths to block from indexing (e.g., '/admin', '/api/*')
 * @property {boolean} [allowAiTraining=true]
 *   Allow AI training bots to crawl content for model training.
 *   Set to false to block bots like GPTBot, Google-Extended, CCBot, etc.
 * @property {boolean} [allowAiReading=true]
 *   Allow AI assistants/chatbots to read content for user responses.
 *   Set to false to block bots like ChatGPT-User, Claude-Web, etc.
 */

export default {};
