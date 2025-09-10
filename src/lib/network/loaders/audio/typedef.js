/**
 * @typedef {object} SourceConfig
 * // property ...
 */

/**
 * @typedef {object} MemorySourceParams
 * @property {string} label - Source identifier
 * @property {string} url - Audio file URL
 * @property {SourceConfig} [config] - Optional source configuration
 */

/**
 * @typedef {object} MemorySource
 * @property {string} label
 * @property {import('./AudioLoader.svelte.js').default} audioLoader
 * @property {SourceConfig} [config]
 */

export default {};
